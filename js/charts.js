google.charts.load('current', { packages: ['corechart'] });
// google.charts.setOnLoadCallback(drawBarColors);

var wineClassToColor = {
    0: 'brown',
    1: 'red',
    2: 'yellow'
}

var winesChartHeightFactor = 50;

function drawWinesChart(wines, maxViewWindow) {
    var rawData = [
        ['Wines', 'Amount', { role: 'style' }, { role: 'annotation' }]
    ];

    wines.forEach(function(w) {
        rawData.push([
            w.name,
            w.amount,
            'color: ' + wineClassToColor[w.class],
            w.color
        ])
    });

    var dataTable = google.visualization.arrayToDataTable(rawData);

    var options = {
        title: 'Wines',
        chart: {
            title: 'Wines',
            subtitle: 'Based on the input data'
        },
        hAxis: {
            title: 'Amount',
            viewWindow: {
                min: 0,
                max: maxViewWindow
            }
        },
        vAxis: {
            title: 'Wines'
        },
        bars: 'horizontal',
        legend: {
            position: 'none'
        },
        height: winesChartHeightFactor * (rawData.length - 1)
    };

    var chart = new google.visualization.BarChart(document.getElementById('input-wines-chart'));
    chart.draw(dataTable, options);
}

function drawRemainsWinesChart(tanks, data, maxViewWindow) {
    var rawData = [['Wines', 'Amount', { role: 'style' }, { role: 'annotation' }]];
    var wines_assigned = Array(data.wines.length).fill(0);

    for (var prop in tanks) {
        var v = tanks[prop];

        v.forEach(function(w, i) {
            if (w !== 0) {
                wines_assigned[i] = wines_assigned[i] + w;
            }
        });
    }

    data.wines.forEach(function(w, i) {
        if (wines_assigned[i] < w.amount) {
            rawData.push([
                w.name,
                w.amount - wines_assigned[i],
                'color: ' + wineClassToColor[w.class],
                w.color
            ])
        }
    });

    var dataTable = google.visualization.arrayToDataTable(rawData);

    var options = {
        title: 'Unallocated wines',
        chart: {
            title: 'Wines',
            subtitle: 'Based on the input data'
        },
        hAxis: {
            title: 'Amount',
            viewWindow: {
                min: 0,
                max: maxViewWindow
            }
        },
        vAxis: {
            title: 'Wines'
        },
        bars: 'horizontal',
        legend: {
            position: 'none'
        },
        height: winesChartHeightFactor * (rawData.length - 1)
    };

    var chart = new google.visualization.BarChart(document.getElementById('output-wines-chart'));
    chart.draw(dataTable, options);
}



function drawTanksStacked(tanks) {
    var rawData = [['Id', 'Empty']];

    tanks.forEach(function(t) {
        rawData.push([
            t.id.toString(),
            t.cap
        ])
    });

    var dataTable = google.visualization.arrayToDataTable(rawData);

    var options = {
        title: 'Tanks',
        colors: ['red'],
        hAxis: {
            title: 'Tanks',
            viewWindow: {
                min: 0,
                max: rawData.length - 1
            }
        },
        vAxis: {
            title: 'Total capacity'
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('input-tanks-chart'));
    chart.draw(dataTable, options);
}

function drawTanksOptimized(tanks, data) {
    var rawData = [['Id', 'Empty']];

    data.wines.forEach(function(w) {
        rawData[0].push(w.name);
    });

    tanks.forEach(function(t, i) {
        // id and empty size
        var tankRawData = [data.tanks[i].id.toString(), data.tanks[i].cap - t.reduce((a, b) => a + b, 0)];
        tankRawData = tankRawData.concat(t);
        rawData.push(tankRawData);
    });

    var dataTable = google.visualization.arrayToDataTable(rawData);

    var options = {
        title: 'Tanks with allocated wine',
        isStacked: true,
        hAxis: {
            title: 'Tanks'
        },
        vAxis: {
            title: 'Total capacity'
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('output-tanks-chart'));
    chart.draw(dataTable, options);
}