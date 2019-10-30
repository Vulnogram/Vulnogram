additionalTabs = {
    chartTab: {
        title: 'Chart',
        setValue: function (j) {
            var x = Object.assign({}, j);
            d3.select(document.getElementById("chartHolder")).selectAll('div').remove();
            plotCharts("chartHolder", [x]);
        }
    }
}