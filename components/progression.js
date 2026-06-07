const template = /* html */`
Attempts:
<div class="progression">
	<div v-for="(color, i) in displays" :key="i" :style="{ background: color }"></div>
</div>
`;

/**
 * Visual record of the round: a strip with one slice per guess, in order — the path of
 * colors moved through on the way to (hopefully) the target.
 */
export default {
	template,
	props: {
		/** Display strings of every guess so far, in order */
		displays: { type: Array, default: () => [] },
	},
};
