docEditor.on('ready', async () => {
   console.log('doc Ready!');
});

docEditor.on('change', () => {
      console.log('doc editor changed');
      var v = docEditor.getValue();
      onCalcChange(v.vectorString, v.baseScore);
});
