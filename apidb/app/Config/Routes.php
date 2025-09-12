<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/home', 'Home::index');
$routes->get('/test', 'TestController::helloWorld');
$routes->get('/listusers', 'UserController::listUsers');

$routes->post('/checkusername', 'UserController::checkUsername');
$routes->post('/forgotpassword', 'UserController::forgotPassword');
$routes->post('/verifytoken', 'UserController::verifyToken');
$routes->post('/resetpassword', 'UserController::resetPassword');

$routes->get('/logout', 'AuthController::logout');
$routes->post('/login', 'AuthController::login'); 
$routes->post('/register', 'AuthController::register');

$routes->get('/sitelinks', 'UserController::SiteLinks');
$routes->get('/sitelinks2', 'UserController::SiteLinks2');

$routes->post('/checkbalance', 'UserController::checkBalance', ['filter' => 'auth']);
$routes->get('/profile', 'AuthController::profile', ['filter' => 'auth']);
$routes->post('/getuser', 'AuthController::getUser', ['filter' => 'auth']);
$routes->post('/updateuser', 'AuthController::updateUser', ['filter' => 'auth']);
$routes->post('/changepass', 'AuthController::changePass', ['filter' => 'auth']);



$routes->post('/purchaseitem', 'PurchaseController::purchaseItem', ['filter' => 'auth']);
$routes->post('/getpurchasedplans', 'PurchaseController::getPurchasedPlans', ['filter' => 'auth']);

$routes->get('/orderhistory/(:num)', 'PurchaseController::getOrderHistory/$1');

$routes->post('/orderhistory', 'PurchaseController::getOrderHistory', ['filter' => 'auth']);

$routes->post('/downlines', 'UserController::getDownlines', ['filter' => 'auth']);

$routes->post('/sendinvite', 'UserController::sendInvite', ['filter' => 'auth']);

$routes->post('/transactions', 'TransactionController::getList', ['filter' => 'auth']);
$routes->post('/rewardlist', 'TransactionController::getRewardList', ['filter' => 'auth']);
$routes->post('/ewalletlist', 'TransactionController::getEwalletList', ['filter' => 'auth']);

$routes->post('/getsitelinks', 'UserController::getSiteLinks', ['filter' => 'auth']);
$routes->post('/getsites', 'UserController::getSites', ['filter' => 'auth']);
$routes->post('/addsite', 'UserController::addSite', ['filter' => 'auth']);
$routes->post('/updatesite', 'UserController::updateSite', ['filter' => 'auth']);
$routes->post('/deletesite', 'UserController::deleteSite', ['filter' => 'auth']);

$routes->post('/updatesitelinks', 'UserController::UpdateSiteLinks', ['filter' => 'auth']);


$routes->post('/getallactivitylogs', 'AdminController::getActivities', ['filter' => 'auth']);
$routes->post('/getallusersdropdown', 'AdminController::getAllusersdropdown', ['filter' => 'auth']);

$routes->post('/getallusers', 'AdminController::getAllUsers', ['filter' => 'auth']);
$routes->post('/getholdingtank', 'AdminController::getHoldingTank', ['filter' => 'auth']);
$routes->post('/holdingtankcount', 'AdminController::getHoldingCankCount', ['filter' => 'auth']);


$routes->post('/adminadjustment', 'AdminController::adminAdjustment', ['filter' => 'auth']);
$routes->post('/adminchangepass', 'AdminController::changePassword', ['filter' => 'auth']);
$routes->post('/adminchangeusername', 'AdminController::changeUsername', ['filter' => 'auth']);

$routes->post('/getcategories', 'AdminController::getCategories', ['filter' => 'auth']);
$routes->post('/addcategory', 'AdminController::addCategory', ['filter' => 'auth']);
$routes->post('/updatecategory', 'AdminController::updateCategory', ['filter' => 'auth']);
$routes->post('/deletecategory', 'AdminController::deleteCategory', ['filter' => 'auth']);

$routes->post('/changesponsor', 'AdminController::changeSponsor', ['filter' => 'auth']);
$routes->post('/changecodedsponsor', 'AdminController::changeCodedSponsor', ['filter' => 'auth']);
$routes->post('/changematrixplacement', 'AdminController::changeMatrixPlacement', ['filter' => 'auth']);
$routes->post('/changerank', 'AdminController::changeRank', ['filter' => 'auth']);


$routes->post('/loginasuser', 'AdminController::LoginasUser', ['filter' => 'auth']);

$routes->post('/deleteuser', 'AdminController::deleteUser', ['filter' => 'auth']);
$routes->post('/getsharingpurchases', 'AdminController::getSharingPurchases', ['filter' => 'auth']);
$routes->post('/getalltransactions', 'AdminController::getAllTransactions', ['filter' => 'auth']);

$routes->post('/getglobalsharingmatrix', 'AdminController::getGlobalsharingmatrix', ['filter' => 'auth']);
$routes->post('/simulatematrixentry', 'AdminController::Simulatematrixentry', ['filter' => 'auth']);
$routes->post('/simulatematrixclear', 'AdminController::Simulatematrixclear', ['filter' => 'auth']);

$routes->post('/getdonations', 'AdminController::getDonations', ['filter' => 'auth']);
$routes->post('/updatedonationpurchases', 'AdminController::updateDonationPurchases', ['filter' => 'auth']);

$routes->post('/getgenealogy', 'UserController::getGenealogy', ['filter' => 'auth']);
$routes->post('/gettribe', 'UserController::getTribe', ['filter' => 'auth']);
$routes->post('/getsponsortree', 'UserController::getSponsorTree', ['filter' => 'auth']);

$routes->post('/checkdeposit', 'UserController::checkDeposit', ['filter' => 'auth']);
$routes->post('/disabledeposit', 'UserController::disableDeposit', ['filter' => 'auth']);
$routes->post('/deposit', 'UserController::Deposit', ['filter' => 'auth']);
$routes->post('/getdeposits', 'UserController::getDeposits', ['filter' => 'auth']);
$routes->post('/updatedepositstatus2', 'UserController::updateDepositstatus2', ['filter' => 'auth']);
$routes->post('/updatedeposithash', 'UserController::updateDeposithash', ['filter' => 'auth']);
$routes->post('/getalldeposits', 'UserController::getallDeposits', ['filter' => 'auth']);
$routes->post('/updatedeposit', 'UserController::updateDeposit', ['filter' => 'auth']);
$routes->post('/updatedepositstatus', 'UserController::updateDepositstatus', ['filter' => 'auth']);
$routes->post('/deletedeposit', 'UserController::deleteDeposit', ['filter' => 'auth']);

$routes->post('/matrixplacement', 'AdminController::matrixPlacement', ['filter' => 'auth']);
$routes->post('/adddeposit', 'AdminController::AddDeposit');
$routes->post('/getwithdrawals', 'UserController::getWithdrawals', ['filter' => 'auth']);
$routes->post('/requestwithdraw', 'UserController::requestWithdraw', ['filter' => 'auth']);
$routes->post('/cancelwithdraw', 'UserController::cancelWithdraw', ['filter' => 'auth']);
$routes->post('/getallwithdrawals', 'UserController::getallWithdrawals', ['filter' => 'auth']);
$routes->post('/updatewithdrawstatus', 'UserController::updateWithdrawstatus', ['filter' => 'auth']);
$routes->post('/updatewithdraw', 'UserController::updateWithdraw', ['filter' => 'auth']);
$routes->post('/transferfund', 'UserController::transferFund', ['filter' => 'auth']);

$routes->post('/getstats', 'AdminController::getStats', ['filter' => 'auth']);
$routes->post('/getvideos', 'UserController::getVideos', ['filter' => 'auth']);

$routes->post('/getdownlinestats', 'UserController::getDownlinestats', ['filter' => 'auth']);
$routes->post('/getalluserstats', 'UserController::getAlluserstats', ['filter' => 'auth']);
$routes->post('/getannouncement', 'UserController::getAnnouncement', ['filter' => 'auth']);

$routes->get('/checkdepositstatus', 'UserController::checkDepositstatus');
$routes->get('/servertime', 'UserController::ServerTime');
$routes->get('/runmatrixplacement', 'UserController::RunMatrixPlacement');
$routes->get('/placeuser/(:num)', 'UserController::RunPlaceUser/$1');

$routes->group('/p2p', ['namespace' => 'App\Controllers'], static function ($routes) {
	
	// Catalogs (POST-only now)
    $routes->post('assets', 'P2P::assets');
    $routes->post('fiats', 'P2P::fiats');
    $routes->post('payment-methods', 'P2P::paymentMethods');

    // User payment methods (all POST)
    $routes->post('me/payment-methods/list', 'P2P::listUserPaymentMethods');
    $routes->post('me/payment-methods/create', 'P2P::createUserPaymentMethod');
    $routes->post('me/payment-methods/update', 'P2P::updateUserPaymentMethod'); // expects {id,...}
    $routes->post('me/payment-methods/delete', 'P2P::deleteUserPaymentMethod'); // expects {id}

    // Offers (POST-only)
    $routes->post('offers/list', 'P2P::listOffers');
    $routes->post('offers/create', 'P2P::createOffer');
    $routes->post('offers/get', 'P2P::getOffer');           // expects {id}
    $routes->post('offers/set-status', 'P2P::setOfferStatus'); // expects {id,status}
	$routes->post('offers/myoffers', 'P2P::myOffers');          // expects {id}    
	$routes->post('offers/setofferstatus', 'P2P::setOfferStatus');          // expects {id}    
	$routes->post('offers/modify', 'P2P::modifyOffer');
	$routes->post('offers/cancel', 'P2P::cancelOffer');
    // Orders (POST-only)
    $routes->post('orders/list', 'P2P::listOrders');
    $routes->post('orders/place', 'P2P::placeOrder');
    $routes->post('orders/get', 'P2P::getOrder');           // expects {id}
    $routes->post('orders/mark-paid', 'P2P::markPaid');     // expects {id,...}
    $routes->post('orders/release', 'P2P::release');        // expects {id}
    $routes->post('orders/cancel', 'P2P::cancel');          // expects {id}
    $routes->post('orders/expire', 'P2P::expire');          // expects {id}

    // Order chat (POST-only)
    $routes->post('orders/messages/list', 'P2P::listOrderMessages'); // {order_id}
    $routes->post('orders/messages/post', 'P2P::postOrderMessage');  // {order_id, message_text, file?}

    // Payments (proof) (POST-only, multipart)
    $routes->post('orders/payment-proof', 'P2P::uploadPaymentProof'); // {order_id, proof(file)}

    // Disputes (POST-only)
    $routes->post('disputes/open', 'P2P::openDispute');      // {order_id, reason_code, description?}
    $routes->post('disputes/get', 'P2P::getDispute');        // {id}
    $routes->post('disputes/messages/post', 'P2P::postDisputeMessage'); // {id, message_text, file?}
    $routes->post('disputes/resolve', 'P2P::resolveDispute'); // {id, resolution}

    // Ratings (POST-only)
    $routes->post('orders/rate', 'P2P::rate'); // {order_id, score, comment?}

});

    // Warehouses
    $routes->post('/warehouses', 'WarehouseController::index');
    $routes->post('/warehouses/create', 'WarehouseController::create');
    $routes->post('/warehouses/(:num)/update', 'WarehouseController::update/$1');
    $routes->post('/warehouses/(:num)/delete', 'WarehouseController::delete/$1');
    $routes->post('/warehouses/(:num)/details', 'WarehouseController::details/$1');
    $routes->post('/warehouses/(:num)/add-product', 'WarehouseController::addProduct/$1');
    $routes->post('/warehouses/(:num)/move-product', 'WarehouseController::moveProduct/$1');
    $routes->post('/warehouses/(:num)/remove-product', 'WarehouseController::removeProduct/$1');

    $routes->post('/warehouses/stat', 'WarehouseController::getWarehousesStat');
    

$routes->group('products', ['namespace' => 'App\Controllers'], function($routes) {
    // main listing
    $routes->post('/', 'ProductController::index');
    
    // create/update/delete
    $routes->post('create', 'ProductController::create');
    $routes->post('(:num)/update', 'ProductController::update/$1');
    $routes->post('(:num)/delete', 'ProductController::delete/$1');
    
    // details
    $routes->post('(:num)/details', 'ProductController::details/$1');

    // images
    $routes->post('(:num)/images/add', 'ProductController::addImage/$1');

    // items (stock units)
    $routes->post('(:num)/items/add', 'ProductController::addItem/$1');
    $routes->post('(:num)/items/update', 'ProductController::updateItem/$1');
    $routes->post('(:num)/items/delete', 'ProductController::deleteItem/$1');

    // events
    $routes->post('(:num)/events/add', 'ProductController::addEvent/$1');

    // QR
    $routes->post('(:num)/qr', 'ProductController::qr/$1');
    $routes->post('scan', 'ProductController::scan');
    $routes->post('lookup', 'ProductController::lookup');


    // CSV export
    $routes->post('export', 'ProductController::export');

    // PRODUCT IMAGES
    $routes->post('(:num)/images/upload', 'ProductController::uploadImages/$1');
    $routes->post('(:num)/images/update', 'ProductController::updateImage/$1');
    $routes->post('(:num)/images/delete', 'ProductController::deleteImage/$1');

});


// ================================================================
// User Management Routes
// ================================================================
$routes->group('users', function($routes) {
    $routes->post('/', 'UserController::list');          // list users + summary
    $routes->post('details', 'UserController::details'); // get single user
    $routes->post('save', 'UserController::save');       // insert/update user
    $routes->post('delete', 'UserController::delete');   // delete user
    $routes->post('changepass', 'UserController::changepass');
});

// ================================================================
// Role Management Routes
// ================================================================
$routes->group('roles', function($routes) {
    $routes->post('list', 'RoleController::list');       // list all roles
    $routes->post('save', 'RoleController::save');       // insert/update role
    $routes->post('delete', 'RoleController::delete');   // delete role
});

