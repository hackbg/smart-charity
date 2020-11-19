const { time } = require("openzeppelin-test-helpers");
const DAY_IN_SEC = 86400;

module.exports = {
  nextDayInSec: async function () {
    const latestBlockTime = await time.latest();
    return latestBlockTime.toNumber() + DAY_IN_SEC;
  },
};
