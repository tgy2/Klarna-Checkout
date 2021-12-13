import fetch from 'node-fetch';

const { fakeStoreToKlarnaCart } = require('./fakestore');

const getCarts = require('../../static/carts');
const BASE_URL = 'https://api.playground.klarna.com';

function getKlarnaAuth() {
	const username = process.env.PUBLIC_KEY;
	const password = process.env.SECRET_KEY;
	const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
	return auth;
}

function formatCart(currentCart) {
	currentCart.forEach((cartItem) => {
		cartItem.total_amount = cartItem.quantity * cartItem.unit_price;
		cartItem.total_tax_amount =
			cartItem.total_amount - (cartItem.total_amount * 10000) / (10000 + cartItem.tax_rate);
	});
	return currentCart;
}

// 1. Add async createOrder function that returns Klarna response.json()
async function createOrder(fakeStoreCart) {
	const currentCart = fakeStoreToKlarnaCart(fakeStoreCart);
	const formatedCart = formatCart(currentCart);

	let order_amount = 0;
	let order_tax_amount = 0;

	formatedCart.forEach((currentCartItem) => {
		order_amount += currentCartItem.total_amount;
		order_tax_amount += currentCartItem.total_tax_amount;
	});

	const SHIPPING_LIMIT = 500 * 100;
	const SHIPPING_PRICE = 39 * 100;

	let shipping_options = [
		{
			id: 'express_priority',
			name: 'EXPRESS 1-2 Days',
			price: 0,
			tax_amount: 0,
			tax_rate: 0
		}
	];

	if (order_amount === 0) {
	} else if (order_amount < SHIPPING_LIMIT) {
		shipping_options[0].price = SHIPPING_PRICE;
	}
	//Sub parts
	const path = '/checkout/v3/orders';
	const auth = getKlarnaAuth();

	//Main parts
	const url = BASE_URL + path;
	const method = 'POST';
	const headers = {
		'Content-Type': 'application/json',
		Authorization: auth
	};

	const body = {
		purchase_country: 'SE',
		purchase_currency: 'SEK',
		locale: 'sv-SE',
		order_amount: order_amount,
		order_tax_amount: order_tax_amount,
		order_lines: formatedCart,
		merchant_urls: {
			terms: 'https://www.example.com/terms.html',
			checkout: 'https://www.example.com/checkout.html',
			confirmation: `${process.env.CONFIRMATION_URL}/confirmation?order_id={checkout.order.id}`,
			push: 'https://www.example.com/api/push'
		},
		shipping_options
	};

	const stringifiedBody = JSON.stringify(body);

	const response = await fetch(url, {
		method,
		headers,
		body: stringifiedBody
	});
	const jsonResponse = await response.json();

	if (response.status === 200 || response.status === 201) {
		return jsonResponse;
	} else {
		console.error('ERROR: ', jsonResponse);
		return {
			html_snippet: `<h1>${JSON.stringify(jsonResponse)}</h1>`
		};
	}
}

// 2. Add async retrieveOrder function that returns Klarna response.json()

async function retrieveOrder(order_id) {
	//Sub parts
	const path = '/checkout/v3/orders/' + order_id;
	const auth = getKlarnaAuth();

	//Main parts
	const url = BASE_URL + path;
	const method = 'GET';
	const headers = {
		Authorization: auth
	};

	const response = await fetch(url, {
		method,
		headers
	});

	if (response.status === 200 || response.status === 201) {
		const jsonResponse = await response.json();
		return jsonResponse;
	} else {
		console.error('ERROR: ', response.status, response.statusText);
		return {
			html_snippet: `<h1> ${JSON.stringify(jsonResponse)} </h1>`
		};
	}
}

// 3. export createOrder and retrieveOrder below, and use them in api/client/index.js and api/client/confirmation.js
module.exports = { getKlarnaAuth, createOrder, retrieveOrder };
