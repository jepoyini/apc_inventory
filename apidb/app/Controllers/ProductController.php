<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

include 'app/Helpers/db.php';
include 'app/Helpers/functions.php';

class ProductController extends ResourceController
{

    public function lookup()
    {
        $db = \Config\Database::connect();
        $req = json_decode(file_get_contents("php://input"), true);
        $code = trim($req['code'] ?? '');

        if (!$code) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => 'Missing code'
            ]);
        }

        // Try to match code against items or products
        $builder = $db->table('items i')
            ->select('i.id as item_id, i.serial_or_batch as code, 
                      p.id as product_id, p.name, p.sku, 
                      pi.url as primary_image')
            ->join('products p', 'p.id=i.product_id')
            ->join('product_images pi', 'pi.product_id=p.id AND pi.is_primary=1', 'left')
            ->where('i.serial_or_batch', $code);

        $row = $builder->get()->getRowArray();

        if (!$row) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => 'Not found'
            ]);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data'   => $row
        ]);
    }
    
    public function scan()
    {
        $db = \Config\Database::connect();
        $req = $this->request->getJSON(true);

        $code        = trim($req['code'] ?? '');
        $action      = $req['action'] ?? null;
        $warehouseId = $req['warehouse_id'] ?? null; // ✅ new
        $userId      = session()->get('uid');

        if (!$code) {
            return $this->response->setJSON(['status' => 'error', 'message' => 'Missing code']);
        }

        try {
            $productId = null;

            // 🔹 Lookup by item serial/batch
            $item = $db->table('items')
                ->select('id, product_id')
                ->where('serial_or_batch', $code)
                ->get()->getRowArray();

            if ($item) {
                $productId = $item['product_id'];
            } else {
                // 🔹 fallback: product by SKU
                $product = $db->table('products')
                    ->select('id')
                    ->where('sku', $code)
                    ->get()->getRowArray();

                if (!$product) {
                    return $this->response->setJSON([
                        'status'  => 'error',
                        'message' => 'Code not found'
                    ]);
                }
                $productId = $product['id'];
            }

            // 🔹 Insert tracking record
            $trackingData = [
                'product_id'    => $productId,
                'tracking_code' => $code,
                'action'        => $action,
                'user_id'       => $userId,
                'created_at'    => date('Y-m-d H:i:s'),
            ];

            $trackingData['warehouse_id'] = $warehouseId;
            $db->table('product_tracking')->insert($trackingData);

            // 🔹 Fetch product info with image
            $productData = $db->table('products p')
                ->select('p.id, p.sku, p.name, p.category, pi.url as primary_image')
                ->join('product_images pi', 'pi.product_id = p.id AND pi.is_primary = 1', 'left')
                ->where('p.id', $productId)
                ->get()->getRowArray();

            // 🔹 Fetch warehouse info if applicable

            $warehouseName = null;
            if ($warehouseId) {
                $w = $db->table('warehouses')->select('name')->where('id', $warehouseId)->get()->getRowArray();
                $warehouseName = $w['name'] ?? null;
            }

            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Scan saved',
                'product' => $productData,
                'product_id' => $productId,
                'name' => $product['name'] ?? null,
                'primary_image' => $product['primary_image'] ?? null,
                'tracking_code' => $code,
                'action' => $action,
                'warehouse_name' => $warehouseName
            ]);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    public function scan1()
    {
        $db = \Config\Database::connect();
        $req = $this->request->getJSON(true);

        $code   = trim($req['code'] ?? '');
        $action = $req['action'] ?? null;
        $userId = session()->get('uid'); // adjust depending on your auth/session

        if (!$code) {
            return $this->response->setJSON(['status' => 'error', 'message' => 'Missing code']);
        }

        try {
            $productId = null;

            // 🔹 Try to match by item serial/batch
            $builder = $db->table('items');
            $builder->select('id, product_id');
            $builder->where('serial_or_batch', $code);
            $item = $builder->get()->getRowArray();

            if ($item) {
                $productId = $item['product_id'];
            } else {
                // 🔹 fallback: try product by SKU
                $builder = $db->table('products');
                $builder->select('id');
                $builder->where('sku', $code);
                $product = $builder->get()->getRowArray();

                if (!$product) {
                    return $this->response->setJSON([
                        'status'  => 'error',
                        'message' => 'Code not found'
                    ]);
                }
                $productId = $product['id'];
            }

            // 🔹 Log to tracking
            $db->table('product_tracking')->insert([
                'product_id'    => $productId,
                'tracking_code' => $code,
                'action'        => $action,
                'user_id'       => $userId,
                'created_at'    => date('Y-m-d H:i:s'),
            ]);

            // 🔹 Fetch product details (with primary image)
            $builder = $db->table('products p');
            $builder->select('p.id, p.sku, p.name, p.category, pi.url as primary_image');
            $builder->join('product_images pi', 'pi.product_id = p.id AND pi.is_primary = 1', 'left');
            $builder->where('p.id', $productId);
            $productData = $builder->get()->getRowArray();

            if (!$productData) {
                $productData = ['id' => $productId, 'sku' => $code, 'name' => null, 'primary_image' => null];
            }

            return $this->response->setJSON([
                'status'   => 'success',
                'message'  => 'Scan saved',
                'action'   => $action,
                'product'  => $productData,
            ]);

        } catch (\Exception $e) {
            return $this->response->setJSON([
                'status'  => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }



    /** POST /products/{id}/images/upload  (multipart, field: files[]) */
    public function uploadImages($id = null)
    {

        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');

        // Check product
        $stmt = $conn->prepare("SELECT id FROM products WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $exists = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$exists) return $this->failNotFound('Product not found');

        if (empty($_FILES)) return $this->failValidationErrors('No files uploaded');
        $files = $this->normalizeFiles($_FILES['files'] ?? $_FILES);

        $destDir = rtrim(FCPATH, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'products' . DIRECTORY_SEPARATOR . $id . DIRECTORY_SEPARATOR;
        if (!is_dir($destDir)) @mkdir($destDir, 0775, true);

     

        $allowed = ['jpg','jpeg','png','gif','webp'];
        $inserted = [];
        $errors = [];

        $conn->begin_transaction();
        try {
            // does a primary already exist?
            $stmt = $conn->prepare("SELECT id FROM product_images WHERE product_id=? AND is_primary=1 LIMIT 1");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $hasPrimary = (bool)$stmt->get_result()->fetch_assoc();
            $stmt->close();

            foreach ($files as $f) {

                if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                    $errors[] = ['name'=>$f['name'] ?? 'file', 'error'=>$f['error']];
                    continue;
                }

                $ext = strtolower(pathinfo($f['name'] ?? 'upload', PATHINFO_EXTENSION));
                if (!in_array($ext, $allowed, true)) {
                    $errors[] = ['name'=>$f['name'] ?? 'file', 'error'=>'invalid_type'];
                    continue;
                }
                if (($f['size'] ?? 0) > 10 * 1024 * 1024) { // 10MB limit
                    $errors[] = ['name'=>$f['name'] ?? 'file', 'error'=>'too_large'];
                    continue;
                }

                $basename = bin2hex(random_bytes(8)) . '.' . $ext;
                $target   = $destDir . $basename;
 
                if (!move_uploaded_file($f['tmp_name'], $target)) {
                    $errors[] = ['name'=>$f['name'] ?? 'file', 'error'=>'move_failed'];
                    continue;
                }

                $rel = '/uploads/products/' . $id . '/' . $basename;
                $primary = $hasPrimary ? 0 : 1; // first image becomes primary if none
                if ($primary) $hasPrimary = true;
    
                $alt = substr(pathinfo($f['name'] ?? $basename, PATHINFO_FILENAME), 0, 190);

                $stmt = $conn->prepare("INSERT INTO product_images (product_id, url, is_primary, alt, sort_order) VALUES (?,?,?,?,0)");
                $stmt->bind_param("isis", $id, $rel, $primary, $alt);
                $ok = $stmt->execute();
                $imgId = $stmt->insert_id;
                $stmt->close();

                if ($ok) {
                    $inserted[] = ['id'=>$imgId, 'url'=>$rel, 'is_primary'=>$primary, 'alt'=>$alt];
                } else {
                    $errors[] = ['name'=>$f['name'] ?? 'file', 'error'=>'db_insert_failed'];
                }
            }

            $conn->commit();
        } catch (\Throwable $e) {
            $conn->rollback();
            return $this->fail('Upload failed: ' . $e->getMessage());
        }

        return $this->respond(['uploaded'=>count($inserted), 'images'=>$inserted, 'errors'=>$errors]);
    }

    /** POST /products/{id}/images/update  (JSON or form: image_id, is_primary?, alt?, sort_order?) */
    public function updateImage($id = null)
    {
        global $conn;
        $p = $_POST ?: (json_decode(file_get_contents("php://input"), true) ?? []);
        if (!$id || empty($p['image_id'])) return $this->failValidationErrors('image_id required');
        $imageId = (int)$p['image_id'];
        $makePrimary = !empty($p['is_primary']);

        // image exists?
        $stmt = $conn->prepare("SELECT id FROM product_images WHERE id=? AND product_id=?");
        $stmt->bind_param("ii", $imageId, $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$row) return $this->failNotFound('Image not found');

        if ($makePrimary) {
            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("UPDATE product_images SET is_primary=0 WHERE product_id=?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $stmt->close();

                $one = 1;
                $stmt = $conn->prepare("UPDATE product_images SET is_primary=? WHERE id=?");
                $stmt->bind_param("ii", $one, $imageId);
                $stmt->execute();
                $stmt->close();

                $conn->commit();
            } catch (\Throwable $e) {
                $conn->rollback();
                return $this->fail('Update failed: ' . $e->getMessage());
            }
        } else {
            // optional alt/sort_order updates
            $fields=[]; $vals=[]; $types='';
            if (isset($p['alt'])) { $fields[]='alt=?'; $vals[]=$p['alt']; $types.='s'; }
            if (isset($p['sort_order'])) { $fields[]='sort_order=?'; $vals[]=(int)$p['sort_order']; $types.='i'; }
            if ($fields) {
                $vals[] = $imageId; $types.='i';
                $sql = "UPDATE product_images SET " . implode(',', $fields) . " WHERE id=?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$vals);
                $stmt->execute();
                $stmt->close();
            }
        }

        // return list back
        $stmt = $conn->prepare("SELECT id, url, is_primary, alt, sort_order, created_at FROM product_images WHERE product_id=? ORDER BY is_primary DESC, sort_order ASC, id DESC");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $imgs = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $this->respond(['updated'=>true, 'images'=>$imgs]);
    }

    /** POST /products/{id}/images/delete  (JSON or form: image_id) */
    public function deleteImage($id = null)
    {
        global $conn;
        $p = $_POST ?: (json_decode(file_get_contents("php://input"), true) ?? []);
        if (!$id || empty($p['image_id'])) return $this->failValidationErrors('image_id required');
        $imageId = (int)$p['image_id'];

        // fetch image
        $stmt = $conn->prepare("SELECT id, url, is_primary FROM product_images WHERE id=? AND product_id=?");
        $stmt->bind_param("ii", $imageId, $id);
        $stmt->execute();
        $img = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$img) return $this->failNotFound('Image not found');

        $filePath = rtrim(FCPATH, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . ltrim($img['url'], '/');
        $wasPrimary = (int)$img['is_primary'] === 1;

        $conn->begin_transaction();
        try {
            // delete db record
            $stmt = $conn->prepare("DELETE FROM product_images WHERE id=?");
            $stmt->bind_param("i", $imageId);
            $stmt->execute();
            $stmt->close();

            // delete file best-effort
            if (is_file($filePath)) @unlink($filePath);

            if ($wasPrimary) {
                // promote a remaining image as primary
                $stmt = $conn->prepare("SELECT id FROM product_images WHERE product_id=? ORDER BY id DESC LIMIT 1");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $next = $stmt->get_result()->fetch_assoc();
                $stmt->close();
                if ($next) {
                    $one=1;
                    $stmt = $conn->prepare("UPDATE product_images SET is_primary=? WHERE id=?");
                    $stmt->bind_param("ii", $one, $next['id']);
                    $stmt->execute();
                    $stmt->close();
                }
            }

            $conn->commit();
        } catch (\Throwable $e) {
            $conn->rollback();
            return $this->fail('Delete failed: ' . $e->getMessage());
        }

        return $this->respondDeleted(['deleted'=>true]);
    }

    /** helper: normalize $_FILES */
    private function normalizeFiles($f)
    {
        $out = [];
        if (isset($f['name']) && is_array($f['name'])) {
            $n = count($f['name']);
            for ($i=0; $i<$n; $i++) {
                $out[] = [
                    'name' => $f['name'][$i] ?? null,
                    'type' => $f['type'][$i] ?? null,
                    'tmp_name' => $f['tmp_name'][$i] ?? null,
                    'error' => $f['error'][$i] ?? null,
                    'size' => $f['size'][$i] ?? null,
                ];
            }
        } elseif (isset($f['name'])) {
            $out[] = $f;
        } else {
            foreach ($f as $one) $out[] = $one;
        }
        return $out;
    }


    /** POST /products  — list + filters + pagination + summary */
    public function index()
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];

        $page   = max(1, (int)($p['page']  ?? 1));
        $limit  = max(1, min(100, (int)($p['limit'] ?? 12)));
        $offset = ($page - 1) * $limit;

        $search    = trim((string)($p['search'] ?? ''));
        $category  = trim((string)($p['category'] ?? ''));
        $warehouse = trim((string)($p['warehouse'] ?? ''));
        $status    = trim((string)($p['status'] ?? ''));
        $stockLvl  = trim((string)($p['stockLevel'] ?? '')); // '', 'low', 'out'
        $tagsIn    = is_array($p['tags'] ?? null) ? $p['tags'] : [];

        $where  = [];
        $params = [];
        $types  = '';

        if ($search !== '') {
            $where[] = "(p.name LIKE ? OR p.sku LIKE ? OR p.category LIKE ?)";
            $like = "%{$search}%";
            array_push($params, $like, $like, $like);
            $types .= 'sss';
        }
        if ($category !== '') {
            $where[] = "p.category = ?";
            $params[] = $category; $types .= 's';
        }
        if ($status !== '') {
            $where[] = "p.status = ?";
            $params[] = $status; $types .= 's';
        }
        if ($warehouse !== '') {
            $where[] = "(p.default_warehouse_id = ?)";
            $params[] = (int)$warehouse; $types .= 'i';
        }
        if ($tagsIn) {
            $ph = implode(',', array_fill(0, count($tagsIn), '?'));
            $where[] = "p.id IN (SELECT pt.product_id FROM products_tags pt WHERE pt.tag_text IN ($ph))";
            foreach ($tagsIn as $t) { $params[] = (string)$t; $types .= 's'; }
        }
        if ($stockLvl === 'low') {
            $where[] = "(p.reorder_point>0 AND (SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status IN ('IN_STOCK','RESERVED')) <= p.reorder_point)";
        } elseif ($stockLvl === 'out') {
            $where[] = "NOT EXISTS (SELECT 1 FROM items i WHERE i.product_id=p.id AND i.status IN ('IN_STOCK','RESERVED'))";
        }

        $sqlWhere = $where ? ("WHERE ".implode(" AND ", $where)) : '';

        // total
        $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM products p {$sqlWhere}");
        if ($types) { $stmt->bind_param($types, ...$params); }
        $stmt->execute();
        $total = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0);
        $stmt->close();

        // page list
        $listSql = "
            SELECT
              p.id, p.sku, p.name, p.category, p.status,
              p.price, p.cost, p.default_warehouse_id, p.reorder_point,
              p.brand, p.model, p.description,
              COALESCE((
                SELECT url FROM product_images pi
                WHERE pi.product_id=p.id
                ORDER BY is_primary DESC, id ASC LIMIT 1
              ), '') AS primary_image,
              -- quantities
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id),0) AS total_qty,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status='IN_STOCK'),0) AS available_qty,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status='RESERVED'),0) AS reserved_qty,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status='SHIPPED'),0) AS shipped_qty
            FROM products p
            {$sqlWhere}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?";
        $listParams = $params; $listTypes = $types.'ii';
        $listParams[] = $limit; $listParams[] = $offset;

        $stmt = $conn->prepare($listSql);
        $stmt->bind_param($listTypes, ...$listParams);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // attach tags
        if ($rows) {
            $ids = array_column($rows, 'id');
            $ph  = implode(',', array_fill(0, count($ids), '?'));
            $tps = str_repeat('i', count($ids));
            $stmt = $conn->prepare("SELECT product_id, tag_text FROM products_tags WHERE product_id IN ($ph)");
            $stmt->bind_param($tps, ...$ids);
            $stmt->execute();
            $all = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            $tagMap = [];
            foreach ($all as $r) $tagMap[$r['product_id']][] = $r['tag_text'];
            foreach ($rows as &$r) $r['tags'] = $tagMap[$r['id']] ?? [];
        }

        // ---- Summary (ONLY_FULL_GROUP_BY safe) ----
        $whereBlock = $sqlWhere; // e.g. "WHERE p.status = ? AND ..."
        $itemsAvailSql = "SELECT product_id, SUM(status IN ('IN_STOCK','RESERVED')) AS avail
                          FROM items GROUP BY product_id";

        $sumSql = "
            SELECT
              COUNT(*) AS totalProducts,

              COALESCE(SUM(
                p.price * (
                  SELECT SUM(i.status IN ('IN_STOCK','RESERVED'))
                  FROM items i
                  WHERE i.product_id = p.id
                )
              ),0) AS totalValue,

              SUM(p.status='active') AS activeProducts,

              SUM(
                p.reorder_point > 0 AND (
                  (SELECT COUNT(*) FROM items i
                    WHERE i.product_id=p.id AND i.status IN ('IN_STOCK','RESERVED')
                  ) <= p.reorder_point
                )
              ) AS lowStock,

              SUM(
                NOT EXISTS (
                  SELECT 1 FROM items i
                  WHERE i.product_id=p.id AND i.status IN ('IN_STOCK','RESERVED')
                )
              ) AS outOfStock

            FROM products p
            $sqlWhere
        ";

        $stmt = $conn->prepare($sumSql);
        if ($types) { 
            $stmt->bind_param($types, ...$params); 
        }
        $stmt->execute();
        $summary = $stmt->get_result()->fetch_assoc() ?? [];
        $stmt->close();




        return $this->respond([
            'products'     => $rows,
            'totalRecords' => $total,
            'summary'      => [
                'totalProducts'  => (int)($summary['totalProducts'] ?? 0),
                'totalValue'     => (float)($summary['totalValue'] ?? 0),
                'activeProducts' => (int)($summary['activeProducts'] ?? 0),
                'lowStock'       => (int)($summary['lowStock'] ?? 0),
                'outOfStock'     => (int)($summary['outOfStock'] ?? 0),
            ],
        ]);
    }

    /** POST /products/create */
    public function create()
    {
        global $conn;

        $p = json_decode(file_get_contents("php://input"), true) ?? [];

        // basic validation
        foreach (['sku','name','category'] as $k) {
            if (empty($p[$k])) return $this->failValidationErrors("$k is required");
        }

        // prepare variables (must be variables, not expressions)
        $sku   = (string)$p['sku'];
        $name  = (string)$p['name'];
        $cat   = (string)$p['category'];
        $stat  = isset($p['status']) && $p['status'] !== '' ? (string)$p['status'] : 'active';

        $price = isset($p['price']) ? (float)$p['price'] : 0.0;
        $cost  = isset($p['cost'])  ? (float)$p['cost']  : 0.0;

        // allow NULL for default_warehouse_id if blank/absent
        $dwid  = (isset($p['default_warehouse_id']) && $p['default_warehouse_id'] !== '' && $p['default_warehouse_id'] !== null)
                ? (int)$p['default_warehouse_id'] : null;

        $rop   = isset($p['reorder_point']) ? (int)$p['reorder_point'] : 0;

        // nullable strings are fine with "s" when value is NULL
        $brand = array_key_exists('brand',$p) ? ( ($p['brand'] === '' ? null : (string)$p['brand']) ) : null;
        $model = array_key_exists('model',$p) ? ( ($p['model'] === '' ? null : (string)$p['model']) ) : null;
        $desc  = array_key_exists('description',$p) ? ( ($p['description'] === '' ? null : (string)$p['description']) ) : null;

        $sql = "INSERT INTO products
                (sku, name, category, status, price, cost, default_warehouse_id, reorder_point, brand, model, description)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) return $this->fail('Prepare failed: '.$conn->error);

        // types: s s s s d d i i s s s
        $types = "ssssddiiiss";
        $stmt->bind_param(
            $types,
            $sku, $name, $cat, $stat,
            $price, $cost,
            $dwid, $rop,
            $brand, $model, $desc
        );

        $ok = $stmt->execute();
        $newId = $stmt->insert_id;
        $stmt->close();

        if (!$ok) return $this->fail('Insert failed: '.$conn->error);

        // tags (optional)
        if (!empty($p['tags']) && is_array($p['tags'])) {
            $ins = $conn->prepare("INSERT INTO products_tags (product_id, tag_text) VALUES (?,?)");
            if ($ins) {
                foreach ($p['tags'] as $t) {
                    $tt = trim((string)$t);
                    if ($tt === '') continue;
                    $ins->bind_param("is", $newId, $tt);
                    $ins->execute();
                }
                $ins->close();
            }
        }

        return $this->respondCreated(['product_id' => $newId]);
    }

    /** POST /products/{id}/update */
    public function update($id = null)
    {
        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');
        $p = json_decode(file_get_contents("php://input"), true) ?? [];

        $fields = []; $vals = []; $types = '';
        $map = [
            'sku'=>'s','name'=>'s','category'=>'s','status'=>'s',
            'price'=>'d','cost'=>'d','default_warehouse_id'=>'i','reorder_point'=>'i',
            'brand'=>'s','model'=>'s','description'=>'s'
        ];
        foreach ($map as $k=>$t) {
            if (array_key_exists($k,$p)) {
                $fields[]="$k=?";
                $vals[] = ($t==='i' ? (int)$p[$k] : ($t==='d' ? (float)$p[$k] : $p[$k]));
                $types .= $t;
            }
        }
        if (!$fields) return $this->respond(['message'=>'Nothing to update']);

        $vals[] = (int)$id; $types .= 'i';
        $sql = "UPDATE products SET ".implode(',', $fields)." WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$vals);
        $ok = $stmt->execute();
        $stmt->close();
        if (!$ok) return $this->fail('Update failed');

        if (isset($p['tags']) && is_array($p['tags'])) {
            $conn->query("DELETE FROM products_tags WHERE product_id=".(int)$id);
            $ins = $conn->prepare("INSERT INTO products_tags (product_id, tag_text) VALUES (?,?)");
            foreach ($p['tags'] as $t) {
                $tt = trim((string)$t);
                if ($tt==='') continue;
                $pid=(int)$id;
                $ins->bind_param("is", $pid, $tt);
                $ins->execute();
            }
            $ins->close();
        }

        return $this->respond(['updated'=>true]);
    }

    /** POST /products/{id}/delete */
    public function delete($id = null)
    {
        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');

        $stmt = $conn->prepare("DELETE FROM product_images WHERE product_id=?"); $stmt->bind_param("i",$id); $stmt->execute(); $stmt->close();
        $stmt = $conn->prepare("DELETE FROM products_tags  WHERE product_id=?"); $stmt->bind_param("i",$id); $stmt->execute(); $stmt->close();
        $stmt = $conn->prepare("DELETE FROM product_specs  WHERE product_id=?"); $stmt->bind_param("i",$id); $stmt->execute(); $stmt->close();
        $stmt = $conn->prepare("DELETE FROM product_events WHERE product_id=?"); $stmt->bind_param("i",$id); $stmt->execute(); $stmt->close();

        $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        $stmt->close();

        if (!$ok) return $this->fail('Delete failed');
        return $this->respondDeleted(['deleted'=>true]);
    }

    // /** POST /products/{id}/details */
    // public function details($id = null)
    // {
    //     global $conn;
    //     if (!$id) return $this->failValidationErrors('Missing id');

    //     $stmt = $conn->prepare("SELECT * FROM products WHERE id=?");
    //     $stmt->bind_param("i",$id); $stmt->execute();
    //     $product = $stmt->get_result()->fetch_assoc(); $stmt->close();
    //     if (!$product) return $this->failNotFound('Product not found');

    //     // Tags
    //     $stmt = $conn->prepare("SELECT tag_text FROM products_tags WHERE product_id=? ORDER BY tag_text ASC");
    //     $stmt->bind_param("i",$id); $stmt->execute();
    //     $tags = array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC),'tag_text'); 
    //     $stmt->close();

    //     // Images
    //     $stmt = $conn->prepare("SELECT id,url,is_primary FROM product_images WHERE product_id=? ORDER BY is_primary DESC, id ASC");
    //     $stmt->bind_param("i",$id); $stmt->execute();
    //     $images = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); 
    //     $stmt->close();

    //     // Stock counts
    //     $stock = ['available'=>0,'reserved'=>0,'shipped'=>0,'total'=>0];
    //     foreach (['available'=>'IN_STOCK','reserved'=>'RESERVED','shipped'=>'SHIPPED'] as $k=>$label) {
    //         $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM items WHERE product_id=? AND status=?");
    //         $stmt->bind_param("is",$id,$label); $stmt->execute();
    //         $stock[$k] = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0); 
    //         $stmt->close();
    //     }
    //     $stock['total'] = $stock['available'] + $stock['reserved'] + $stock['shipped'];

    //     // Item list
    //     $stmt = $conn->prepare("
    //         SELECT id, serial_or_batch AS serial, location_code, condition_label, status, acquired_at
    //         FROM items WHERE product_id=? AND status<>'DISPOSED' ORDER BY id DESC LIMIT 200
    //     ");
    //     $stmt->bind_param("i",$id); $stmt->execute();
    //     $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); 
    //     $stmt->close();

    //     // Events
    //     $stmt = $conn->prepare("
    //         SELECT id, event_type, description, actor, quantity, warehouse_name, created_at
    //         FROM product_events WHERE product_id=? ORDER BY created_at DESC LIMIT 50
    //     ");
    //     $stmt->bind_param("i",$id); $stmt->execute();
    //     $events = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); 
    //     $stmt->close();

    //     // Tracking history
    //     $stmt = $conn->prepare("
    //         SELECT id, tracking_code, status, location, remarks, created_at
    //         FROM product_tracking
    //         WHERE product_id=? ORDER BY created_at DESC LIMIT 100
    //     ");
    //     $stmt->bind_param("i",$id); 
    //     $stmt->execute();
    //     $tracking = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    //     $stmt->close();

    //     // Specs
    //     $stmt = $conn->prepare("SELECT spec_key, spec_value FROM product_specs WHERE product_id=?");
    //     $stmt->bind_param("i",$id); $stmt->execute();
    //     $specs = [];
    //     foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $r) {
    //         $specs[$r['spec_key']] = $r['spec_value'];
    //     }
    //     $stmt->close();

    //     // Primary image fallback
    //     $stmt = $conn->prepare("SELECT url FROM product_images WHERE product_id=? AND is_primary=1 LIMIT 1");
    //     $stmt->bind_param("i", $id);
    //     $stmt->execute();
    //     $rec = $stmt->get_result()->fetch_assoc();
    //     $stmt->close();

    //     $product['primary_image'] = ($rec && !empty($rec['url']))
    //         ? $rec['url']
    //         : "/images/noimage.png";

    //     $product['tags'] = $tags;

    //     return $this->respond([
    //         'product'  => $product,
    //         'images'   => $images,
    //         'tracking' => $tracking,   // ✅ now populated
    //         'stock'    => [
    //             'total'=>$stock['total'],
    //             'available'=>$stock['available'],
    //             'reserved'=>$stock['reserved'],
    //             'shipped'=>$stock['shipped'],
    //             'lowAlert'=>(int)($product['reorder_point'] ?? 0),
    //         ],
    //         'items'    => $items,
    //         'events'   => $events,
    //         'specs'    => $specs,
    //     ]);
    // }

    /** POST /products/{id}/details */
    public function details($id = null)
    {
        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');

        $stmt = $conn->prepare("SELECT * FROM products WHERE id=?");
        $stmt->bind_param("i",$id); $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc(); $stmt->close();
        if (!$product) return $this->failNotFound('Product not found');

        $stmt = $conn->prepare("SELECT tag_text FROM products_tags WHERE product_id=? ORDER BY tag_text ASC");
        $stmt->bind_param("i",$id); $stmt->execute();
        $tags = array_column($stmt->get_result()->fetch_all(MYSQLI_ASSOC),'tag_text'); $stmt->close();

        $stmt = $conn->prepare("SELECT id,url,is_primary FROM product_images WHERE product_id=? ORDER BY is_primary DESC, id ASC");
        $stmt->bind_param("i",$id); $stmt->execute();
        $images = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); $stmt->close();

        $stock = ['available'=>0,'reserved'=>0,'shipped'=>0,'total'=>0];
        foreach (['available'=>'IN_STOCK','reserved'=>'RESERVED','shipped'=>'SHIPPED'] as $k=>$label) {
            $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM items WHERE product_id=? AND status=?");
            $stmt->bind_param("is",$id,$label); $stmt->execute();
            $stock[$k] = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0); $stmt->close();
        }
        $stock['total'] = $stock['available'] + $stock['reserved'] + $stock['shipped'];

        $stmt = $conn->prepare("
            SELECT id, serial_or_batch AS serial, location_code, condition_label, status, acquired_at
            FROM items WHERE product_id=? AND status<>'DISPOSED' ORDER BY id DESC LIMIT 200
        ");
        $stmt->bind_param("i",$id); $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); $stmt->close();

        $stmt = $conn->prepare("
            SELECT id, event_type, description, actor, quantity, warehouse_name, created_at
            FROM product_events WHERE product_id=? ORDER BY created_at DESC LIMIT 50
        ");
        $stmt->bind_param("i",$id); $stmt->execute();
        $events = $stmt->get_result()->fetch_all(MYSQLI_ASSOC); $stmt->close();

        $stmt = $conn->prepare("SELECT spec_key, spec_value FROM product_specs WHERE product_id=?");
        $stmt->bind_param("i",$id); $stmt->execute();
        $specs = [];
        foreach ($stmt->get_result()->fetch_all(MYSQLI_ASSOC) as $r) $specs[$r['spec_key']] = $r['spec_value'];
        $stmt->close();

        $product['tags'] = $tags;

        $stmt = $conn->prepare("SELECT url FROM product_images WHERE product_id=? AND is_primary=1 LIMIT 1");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $rec = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($rec && !empty($rec['url'])) {
            $product['primary_image'] = $rec['url'];
        } else {
            $product['primary_image'] = "/images/noimage.png"; 
        }

        // Tracking history
        $stmt = $conn->prepare("
            SELECT pt.*, CONCAT(u.firstname, ' ', u.lastname) AS fullname
            FROM product_tracking pt
            LEFT JOIN users u ON pt.user_id = u.id
            WHERE pt.product_id=? 
            ORDER BY pt.created_at DESC 
            LIMIT 100
        ");
        $stmt->bind_param("i", $id); 
        $stmt->execute();
        $tracking = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $this->respond([
            'product' => $product,
            'images'  => $images,
            'tracking' => $tracking,
            'stock'   => [
                'total'=>$stock['total'],'available'=>$stock['available'],'reserved'=>$stock['reserved'],'shipped'=>$stock['shipped'],
                'lowAlert'=>(int)($product['reorder_point'] ?? 0),
            ],
            'items'   => $items,
            'events'  => $events,
            'specs'   => $specs,
        ]);
    }

    /** POST /products/{id}/images/add  — url, is_primary */
    public function addImage($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['url'])) return $this->failValidationErrors('url required');

        if (!empty($p['is_primary'])) {
            $stmt = $conn->prepare("UPDATE product_images SET is_primary=0 WHERE product_id=?");
            $stmt->bind_param("i",$id); $stmt->execute(); $stmt->close();
        }
        $isP = !empty($p['is_primary']) ? 1 : 0;
        $stmt = $conn->prepare("INSERT INTO product_images (product_id,url,is_primary) VALUES (?,?,?)");
        $stmt->bind_param("isi", $id, $p['url'], $isP);
        $ok = $stmt->execute(); $newId = $stmt->insert_id; $stmt->close();
        if (!$ok) return $this->fail('Add image failed');
        return $this->respondCreated(['image_id'=>$newId]);
    }

    /** POST /products/{id}/items/add  — qty, serial (opt), location_code, condition_label */
    public function addItem($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['qty'])) return $this->failValidationErrors('qty required');

        $qty  = max(1, (int)$p['qty']);
        $ser  = (string)($p['serial'] ?? '');
        $loc  = (string)($p['location_code'] ?? '');
        $cond = (string)($p['condition_label'] ?? '');

        $ins = $conn->prepare("
            INSERT INTO items (product_id, serial_or_batch, location_code, condition_label, status, acquired_at)
            VALUES (?,?,?,?, 'IN_STOCK', NOW())
        ");
        for ($i=0; $i<$qty; $i++) {
            $s = $ser ? $ser . str_pad((string)($i+1), 3, '0', STR_PAD_LEFT) : null;
            $ins->bind_param("isss", $id, $s, $loc, $cond);
            $ins->execute();
        }
        $ins->close();

        $this->logEvent((int)$id, 'RECEIVED', 'Items added', (int)$qty, null, null);
        return $this->respondCreated(['added'=>$qty]);
    }

    /** POST /products/{id}/items/update  — item_id + fields */
    public function updateItem($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['item_id'])) return $this->failValidationErrors('item_id required');

        $fields=[]; $vals=[]; $types='';
        foreach (['serial_or_batch'=>'s','location_code'=>'s','condition_label'=>'s','status'=>'s','acquired_at'=>'s'] as $k=>$t) {
            if (array_key_exists($k,$p)) { $fields[]="$k=?"; $vals[]=$p[$k]; $types.=$t; }
        }
        if (!$fields) return $this->respond(['message'=>'Nothing to update']);
        $vals[] = (int)$p['item_id']; $types.='i';

        $sql="UPDATE items SET ".implode(',', $fields)." WHERE id=?";
        $stmt=$conn->prepare($sql); $stmt->bind_param($types, ...$vals); $stmt->execute(); $stmt->close();

        return $this->respond(['updated'=>true]);
    }

    /** POST /products/{id}/items/delete  — item_id */
    public function deleteItem($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['item_id'])) return $this->failValidationErrors('item_id required');

        $stmt = $conn->prepare("DELETE FROM items WHERE id=? AND product_id=?");
        $stmt->bind_param("ii", $p['item_id'], $id);
        $stmt->execute(); $aff = $stmt->affected_rows; $stmt->close();

        if ($aff < 1) return $this->failNotFound('Item not found');
        $this->logEvent((int)$id, 'DISPOSED', 'Item removed', 1, null, null);
        return $this->respondDeleted(['deleted'=>true]);
    }

    /** POST /products/{id}/events/add */
    public function addEvent($id = null)
    {
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!$id || empty($p['event_type'])) return $this->failValidationErrors('event_type required');

        $this->logEvent(
            (int)$id,
            (string)$p['event_type'],
            (string)($p['description'] ?? ''),
            (int)($p['quantity'] ?? 0),
            (string)($p['warehouse_name'] ?? ''),
            (string)($p['actor'] ?? '')
        );
        return $this->respondCreated(['logged'=>true]);
    }

    /** POST /products/{id}/qr  — returns text payload only */
    public function qr($id = null)
    {
        global $conn;
        if (!$id) return $this->failValidationErrors('Missing id');
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        $format = strtoupper((string)($p['format'] ?? 'SKU'));
        $custom = trim((string)($p['text'] ?? ''));

        $stmt=$conn->prepare("SELECT sku,name FROM products WHERE id=?");
        $stmt->bind_param("i",$id); $stmt->execute();
        $row=$stmt->get_result()->fetch_assoc(); $stmt->close();
        if (!$row) return $this->failNotFound('Product not found');

        $payload = $row['sku'];
        if ($format==='SKU+NAME') $payload = $row['sku'].' | '.$row['name'];
        if ($format==='CUSTOM' && $custom!=='') $payload = $custom;

        return $this->respond(['payload'=>$payload, 'sku'=>$row['sku'], 'name'=>$row['name']]);
    }

    /** POST /products/export — CSV for current filters */
    public function export()
    {
        // Reuse filters from POST body, run a compact query, return CSV.
        global $conn;
        $p = json_decode(file_get_contents("php://input"), true) ?? [];
        $_POST_JSON = $p; // local alias for reuse

        // Build WHERE same as index (but only a subset needed for CSV)
        $where=[]; $params=[]; $types='';
        $search = trim((string)($p['search'] ?? ''));
        $category = trim((string)($p['category'] ?? ''));
        $status = trim((string)($p['status'] ?? ''));
        $tagsIn = is_array($p['tags'] ?? null) ? $p['tags'] : [];

        if ($search!=='') { $where[]="(p.name LIKE ? OR p.sku LIKE ? OR p.category LIKE ?)"; $like="%{$search}%"; array_push($params,$like,$like,$like); $types.='sss'; }
        if ($category!==''){ $where[]="p.category=?"; $params[]=$category; $types.='s'; }
        if ($status!=='')  { $where[]="p.status=?";   $params[]=$status;   $types.='s'; }
        if ($tagsIn) { $ph=implode(',', array_fill(0, count($tagsIn), '?')); $where[]="p.id IN (SELECT product_id FROM products_tags WHERE tag_text IN ($ph))"; foreach($tagsIn as $t){$params[]=(string)$t;$types.='s';} }
        $sqlWhere = $where ? ("WHERE ".implode(" AND ", $where)) : '';

        $sql = "
            SELECT
              p.sku, p.name, p.category, p.status, p.price, p.cost,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status='IN_STOCK'),0) AS available_qty,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status='RESERVED'),0)  AS reserved_qty,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id AND i.status='SHIPPED'),0)   AS shipped_qty,
              COALESCE((SELECT COUNT(*) FROM items i WHERE i.product_id=p.id),0)                          AS total_qty,
              p.default_warehouse_id
            FROM products p
            {$sqlWhere}
            ORDER BY p.created_at DESC
            LIMIT 5000";
        $stmt = $conn->prepare($sql);
        if ($types) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();
        $lines = ["SKU,Name,Category,Status,Price,Cost,Available,Reserved,Shipped,Total,WarehouseId"];
        while ($r = $res->fetch_assoc()) {
            $lines[] = sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%d,%d,%d,%d,%s",
                $r['sku'],
                str_replace('"','""',$r['name']),
                str_replace('"','""',$r['category']),
                $r['status'],
                number_format((float)$r['price'],2,'.',''),
                number_format((float)$r['cost'],2,'.',''),
                (int)$r['available_qty'],
                (int)$r['reserved_qty'],
                (int)$r['shipped_qty'],
                (int)$r['total_qty'],
                ($r['default_warehouse_id'] ?? '')
            );
        }
        $stmt->close();

        return $this->response
            ->setHeader('Content-Type', 'text/csv')
            ->setHeader('Content-Disposition', 'attachment; filename="products_export.csv"')
            ->setBody(implode("\n", $lines));
    }

    // ---------------- helpers ----------------
    private function logEvent(int $productId, string $type, ?string $desc, int $qty = 0, ?string $warehouse = null, ?string $actor = null): void
    {
        global $conn;
        $stmt = $conn->prepare("
            INSERT INTO product_events (product_id, event_type, description, actor, quantity, warehouse_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param("isssis", $productId, $type, $desc, $actor, $qty, $warehouse);
        $stmt->execute();
        $stmt->close();
    }



}
