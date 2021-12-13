const app = require('../../loaders/express-handlebars');

const { createOrder } = require('../../services/server/klarna');
const { getFakeStoreCart } = require('../../services/server/fakestore');

app.get('/checkout/:cart_id', async function (req, res, next) {
	// Replace with HTML snippet from CreateOrder Klarna Request
	// const html_snippet = `<h1>Please make an order request in api/client/index.html</h1>`;
	const cart_id = req.params.cart_id;
	const cartItems = JSON.parse(req.query.cartItems);

	const completeCart = await getFakeStoreCart(cartItems);

	const klarnaJsonResponse = await createOrder(completeCart);

	const html_snippet = klarnaJsonResponse.html_snippet;

	res.render('checkout', {
		klarna_checkout: html_snippet
	});
});

// app.post('/test', function (req, res) {
// 	res.send({
// 		name: 'hey'
// 	});
// });

// app.get('/test', function (req, res) {
// 	res.send({
// 		name: 'adam'
// 	});
// });

module.exports = app;
