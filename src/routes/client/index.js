const app = require('../../loaders/express-handlebars');

const { createOrder } = require('../../services/server/klarna');

app.get('/checkout/:cart_id', async function (req, res, next) {
	// Replace with HTML snippet from CreateOrder Klarna Request
	// const html_snippet = `<h1>Please make an order request in api/client/index.html</h1>`;
	const cart_id = req.params.cart_id;

	console.log(cart_id);
	const klarnaJsonResponse = await createOrder(cart_id);

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
