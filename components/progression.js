const template = /* html */`
<div class="attempt-container">
	<span class="attempts">
		<span>{{ attemptCount }}</span> attempts, <span>{{ uniqueCount }}</span> unique
	</span>
	<div class="progression">
		<div v-for="(color, i) in displays" :key="i" :style="{ background: color }"></div>
	</div>
</div>
`;

/**
 * Visual record of the round: a strip with one slice per guess (in order),
 * plus the attempt/unique counters.
 */
export default {
	template,
	props: {
		/** Display strings of every guess so far, in order */
		displays: { type: Array, default: () => [] },
		attemptCount: { type: Number, default: 0 },
		uniqueCount: { type: Number, default: 0 },
	},
};
