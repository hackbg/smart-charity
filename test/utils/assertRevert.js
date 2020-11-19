module.exports = async (promise, phrase) => {
  try {
    await promise;
    assert.fail("Expected revert not received");
  } catch (error) {
    const phraseFound = error.message.search(phrase) >= 0;
    assert(phraseFound, `Expected "${phrase}", got ${error} instead`);
  }
};
