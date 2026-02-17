
docEditor.on('change', () => {
      var v = docEditor.getValue();
      onCalcChange(v.vectorString, v.baseScore);
});
