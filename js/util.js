import Color from "https://colorjs.io/color.js";

export function $(expr, con) {
	return typeof expr === 'string'? (con || document).querySelector(expr) : expr;
}

export function $$(expr, con) {
	return Array.prototype.slice.call((con || document).querySelectorAll(expr));
}

export function getHint ({meta, color, formatId}) {
	let space = color?.space;

	if (!space) {
		outer: for (let sid in Color.spaces) {
			let s = Color.spaces[sid];
			for (let fid in s.formats) {
				if (formatId in s.formats) {
					space = s;
					break outer;
				}
			}
		}
	}

	formatId ??= meta.formatId;

	if (!space) {
		return "";
	}

	let format = space.formats[formatId];

	if (!format || format.type === "custom") {
		return "";
	}

	let typesUsed = meta?.types;

	let coordMeta = Object.values(space.coords);
	let ranges = coordMeta.map(coord => coord.range || coord.refRange).map(range => range ? `[${range.join(", ")}]` : "");
	let argGrammar = format.coords;

	if (!argGrammar) {
		// Just numbers with ranges
		argGrammar = Array(coordMeta.length).fill("<number>").map((a, i) => a + ranges[i]);

		if (formatId === "color") {
			// color() also has a first argument
			argGrammar.unshift("<ident>");
		}
	}
	else {
		// Add ranges from coord meta to grammar where there are numbers with no range
		argGrammar = argGrammar.map((coord, i) => {
			if (Array.isArray(coord)) {
				coord = coord.map(c => c.type).join(" | ");
			}

			let range = ranges[i];

			if (!range) {
				return coord;
			}

			return coord.replace(/<number>(?!\[)/, "<number>" + range);
		});
	}

	argGrammar = argGrammar.map((a, i) => {
		let content = a.split("|").map(b => {
			let [type, name] = b.match(/<(\w+)>/);
			let active = typesUsed?.[i] == type;

			return `<span class="coord-type${ active? " active" : "" }" data-type="${ name }">${ b.replaceAll("<", "&lt;") }</span>`
		}).join("|")
		return `<span class="coord" title="${ coordMeta[i].name }">${ content }</span>`
	})

	return `${formatId}(
		${ formatId === "color"? "<ident>" : ""}
		${ argGrammar.join(format.commas ? ", " : " ") }
		)`;
}

export { Color }