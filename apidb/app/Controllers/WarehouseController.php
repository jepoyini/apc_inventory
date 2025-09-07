<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

include 'app/Helpers/db.php';
include 'app/Helpers/functions.php';

class WarehouseController extends ResourceController
{
    /** POST /warehouses (list + filter + pagination) */
    public function index()
    {
        global $conn;

        $postData = json_decode(file_get_contents("php://input"), true) ?? [];

        $page   = max(1, (int)($postData['page']  ?? 1));
        $limit  = max(1, min(100, (int)($postData['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        $search = trim((string)($postData['search'] ?? ''));
        $status = trim((string)($postData['status'] ?? ''));

        $where  = [];
        $params = [];
        $types  = '';

        if ($search !== '') {
            $where[] = "(name LIKE ? OR location LIKE ? OR manager LIKE ?)";
            $like = "%{$search}%";
            $params[] = $like; $params[] = $like; $params[] = $like;
            $types .= 'sss';
        }
        if ($status !== '') {
            $where[] = "status = ?";
            $params[] = $status;
            $types .= 's';
        }
        $sqlWhere = $where ? ("WHERE " . implode(" AND ", $where)) : "";

        // total count
        $stmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM warehouses {$sqlWhere}");
        if ($types) { $stmt->bind_param($types, ...$params); }
        $stmt->execute();
        $total = (int)($stmt->get_result()->fetch_assoc()['cnt'] ?? 0);
        $stmt->close();

        // page list
        $listSql    = "SELECT id, name, location, manager, status, capacity, current_stock, created_at
                       FROM warehouses {$sqlWhere}
                       ORDER BY created_at DESC
                       LIMIT ? OFFSET ?";
        $listParams = $params;
        $listTypes  = $types . 'ii';
        $listParams[] = $limit;
        $listParams[] = $offset;

        $stmt = $conn->prepare($listSql);
        $stmt->bind_param($listTypes, ...$listParams);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // summary
        $sumSql = "SELECT
                      COUNT(*) AS totalWarehouses,
                      COALESCE(SUM(capacity),0) AS totalCapacity,
                      COALESCE(SUM(current_stock),0) AS totalStock,
                      SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) AS activeWarehouses,
                      SUM(CASE WHEN capacity>0 AND (current_stock / capacity) > 0.8 THEN 1 ELSE 0 END) AS highUtilization
                   FROM warehouses {$sqlWhere}";
        $stmt = $conn->prepare($sumSql);
        if ($types) { $stmt->bind_param($types, ...$params); }
        $stmt->execute();
        $summary = $stmt->get_result()->fetch_assoc() ?? [];
        $stmt->close();

        $avgUtil = (!empty($summary['totalCapacity']) && (int)$summary['totalCapacity'] > 0)
            ? (int)round(((int)$summary['totalStock'] / (int)$summary['totalCapacity']) * 100)
            : 0;

        return $this->respond([
            'warehouses'   => $rows,
            'totalRecords' => $total,
            'summary'      => [
                'totalWarehouses'    => (int)($summary['totalWarehouses'] ?? 0),
                'totalCapacity'      => (int)($summary['totalCapacity'] ?? 0),
                'totalStock'         => (int)($summary['totalStock'] ?? 0),
                'averageUtilization' => $avgUtil,
                'activeWarehouses'   => (int)($summary['activeWarehouses'] ?? 0),
                'highUtilization'    => (int)($summary['highUtilization'] ?? 0),
            ]
        ]);
    }

    /** POST /warehouses/create */
    public function create()
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];

        if (empty($p['name']) || empty($p['location']) || empty($p['manager'])) {
            return $this->failValidationErrors('name, location, manager are required');
        }

        $status   = $p['status'] ?? 'Active';
        $capacity = (int)($p['capacity'] ?? 0);
        $current  = (int)($p['current_stock'] ?? 0);

        $sql = "INSERT INTO warehouses (name, location, manager, status, capacity, current_stock)
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssii",
            $p['name'],
            $p['location'],
            $p['manager'],
            $status,
            $capacity,
            $current
        );
        $ok = $stmt->execute();
        $newId = $stmt->insert_id;
        $stmt->close();

        if (!$ok) return $this->fail('Insert failed');

        return $this->respondCreated(['warehouse_id' => $newId]);
    }

    /** POST /warehouses/{id}/update */
    public function update($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id) return $this->failValidationErrors('Missing id');

        $fields = [];
        $vals   = [];
        $types  = "";

        foreach (['name','location','manager','status','capacity','current_stock'] as $k) {
            if (array_key_exists($k, $p)) {
                $fields[] = "$k=?";
                if ($k === 'capacity' || $k === 'current_stock') {
                    $vals[]  = (int)$p[$k];
                    $types  .= "i";
                } else {
                    $vals[]  = $p[$k];
                    $types  .= "s";
                }
            }
        }

        if (!$fields) return $this->respond(['message'=>'Nothing to update']);

        $vals[] = (int)$id;
        $types .= "i";

        $sql = "UPDATE warehouses SET ".implode(',', $fields)." WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$vals);
        $ok = $stmt->execute();
        $stmt->close();

        if (!$ok) return $this->fail('Update failed');

        return $this->respond(['updated'=>true]);
    }

    /** POST /warehouses/{id}/delete */
    public function delete($id = null)
    {
        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');

        $stmt = $conn->prepare("SELECT id FROM warehouses WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $exists = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$exists) return $this->failNotFound('Not found');

        $stmt = $conn->prepare("DELETE FROM warehouses WHERE id=?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        $stmt->close();

        if (!$ok) return $this->fail('Delete failed');

        return $this->respondDeleted(['deleted'=>true]);
    }

    /** POST /warehouses/{id}/details */
    public function details($id = null)
    {
        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');

        $stmt = $conn->prepare("SELECT * FROM warehouses WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $w = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$w) return $this->failNotFound('Warehouse not found');

        $stmt = $conn->prepare("
            SELECT product_id, COUNT(*) AS qty
            FROM items
            WHERE current_warehouse_id=? AND status<>'DISPOSED'
            GROUP BY product_id
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        $products = [];
        if ($items) {
            $pids = array_column($items, 'product_id');
            $in   = implode(',', array_fill(0, count($pids), '?'));
            $types= str_repeat("i", count($pids));
            $stmt = $conn->prepare("SELECT id, sku, name, category FROM products WHERE id IN ($in)");
            $stmt->bind_param($types, ...$pids);
            $stmt->execute();
            $prows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            $map = [];
            foreach ($prows as $pr) $map[$pr['id']] = $pr;

            foreach ($items as $it) {
                if (isset($map[$it['product_id']])) {
                    $pr = $map[$it['product_id']];
                    $products[] = [
                        'id'       => (int)$pr['id'],
                        'name'     => $pr['name'],
                        'sku'      => $pr['sku'],
                        'category' => $pr['category'],
                        'quantity' => (int)$it['qty'],
                        'status'   => 'IN_STOCK',
                    ];
                }
            }
        }

        $util = ((int)$w['capacity'] > 0)
            ? (int)round(((int)$w['current_stock'] / (int)$w['capacity']) * 100)
            : 0;

        return $this->respond([
            'warehouse'   => $w,
            'utilization' => $util,
            'products'    => $products
        ]);
    }

    /** POST /warehouses/{id}/add-product */
    public function addProduct($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['product_id']) || empty($p['quantity'])) {
            return $this->failValidationErrors('product_id and quantity required');
        }

        $qty       = max(1, (int)$p['quantity']);
        $productId = (int)$p['product_id'];

        // confirm warehouse exists
        $stmt = $conn->prepare("SELECT id FROM warehouses WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $w = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$w) return $this->failNotFound('Warehouse not found');

        $conn->begin_transaction();
        try {
            $ins = $conn->prepare(
                "INSERT INTO items (product_id, serial_or_batch, qr_code, current_warehouse_id, status)
                 VALUES (?, NULL, NULL, ?, 'IN_STOCK')"
            );
            for ($i = 0; $i < $qty; $i++) {
                $ins->bind_param("ii", $productId, $id);
                $ins->execute();
            }
            $ins->close();

            // refresh stock
            $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM items WHERE current_warehouse_id=? AND status<>'DISPOSED'");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $c = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0);
            $stmt->close();

            $stmt = $conn->prepare("UPDATE warehouses SET current_stock=? WHERE id=?");
            $stmt->bind_param("ii", $c, $id);
            $stmt->execute();
            $stmt->close();

            $conn->commit();
            return $this->respond(['added' => $qty, 'current_stock' => $c]);
        } catch (\Throwable $e) {
            $conn->rollback();
            return $this->fail('Add failed: ' . $e->getMessage());
        }
    }

    /** POST /warehouses/{id}/move-product */
    public function moveProduct($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['product_id']) || empty($p['to_warehouse_id']) || empty($p['quantity'])) {
            return $this->failValidationErrors('product_id, to_warehouse_id, quantity required');
        }

        $qty  = max(1, (int)$p['quantity']);
        $pid  = (int)$p['product_id'];
        $toId = (int)$p['to_warehouse_id'];

        $conn->begin_transaction();
        try {
            // select N items to move
            $stmt = $conn->prepare("
                SELECT id FROM items
                WHERE current_warehouse_id=? AND product_id=? AND status='IN_STOCK'
                LIMIT ?
            ");
            $stmt->bind_param("iii", $id, $pid, $qty);
            $stmt->execute();
            $ids = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            if (!$ids) {
                $conn->rollback();
                return $this->failValidationErrors('No available items to move');
            }

            $idList = array_column($ids, 'id');
            $place  = implode(',', array_fill(0, count($idList), '?'));
            $types  = 'i' . str_repeat('i', count($idList));
            $params = array_merge([$toId], $idList);

            $sql = "UPDATE items SET current_warehouse_id=? WHERE id IN ($place)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $stmt->close();

            // refresh stocks for both warehouses
            foreach ([(int)$id, $toId] as $wid) {
                $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM items WHERE current_warehouse_id=? AND status<>'DISPOSED'");
                $stmt->bind_param("i", $wid);
                $stmt->execute();
                $c = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0);
                $stmt->close();

                $stmt = $conn->prepare("UPDATE warehouses SET current_stock=? WHERE id=?");
                $stmt->bind_param("ii", $c, $wid);
                $stmt->execute();
                $stmt->close();
            }

            $conn->commit();
            return $this->respond(['moved'=>count($idList)]);
        } catch (\Throwable $e) {
            $conn->rollback();
            return $this->fail('Move failed: '.$e->getMessage());
        }
    }

    /** POST /warehouses/{id}/remove-product */
    public function removeProduct($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['product_id']) || empty($p['quantity'])) {
            return $this->failValidationErrors('product_id and quantity required');
        }

        $qty = max(1, (int)$p['quantity']);
        $pid = (int)$p['product_id'];

        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare("
                SELECT id FROM items
                WHERE current_warehouse_id=? AND product_id=? AND status='IN_STOCK'
                LIMIT ?
            ");
            $stmt->bind_param("iii", $id, $pid, $qty);
            $stmt->execute();
            $ids = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            if (!$ids) {
                $conn->rollback();
                return $this->failValidationErrors('No available items to remove');
            }

            $idList = array_column($ids, 'id');
            $place  = implode(',', array_fill(0, count($idList), '?'));
            $types  = str_repeat('i', count($idList));

            $sql = "UPDATE items SET status='DISPOSED' WHERE id IN ($place)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$idList);
            $stmt->execute();
            $stmt->close();

            // refresh stock
            $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM items WHERE current_warehouse_id=? AND status<>'DISPOSED'");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $c = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0);
            $stmt->close();

            $stmt = $conn->prepare("UPDATE warehouses SET current_stock=? WHERE id=?");
            $stmt->bind_param("ii", $c, $id);
            $stmt->execute();
            $stmt->close();

            $conn->commit();
            return $this->respond(['removed'=>count($idList), 'current_stock'=>$c]);
        } catch (\Throwable $e) {
            $conn->rollback();
            return $this->fail('Remove failed: '.$e->getMessage());
        }
    }
}
