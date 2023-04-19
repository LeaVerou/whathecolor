export function $(expr, con) {
	return typeof expr === 'string'? (con || document).querySelector(expr) : expr;
}

export function $$(expr, con) {
	return Array.prototype.slice.call((con || document).querySelectorAll(expr));
}