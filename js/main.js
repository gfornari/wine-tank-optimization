$(function() {
    var data = null;
    var solution = null;
    var winesMaxAmount = 0;

    var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
    function handleFile(e) {
        var files = e.target.files, f = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var res = e.target.result;
            if(!rABS) res = new Uint8Array(res);
            var workbook = XLSX.read(res, {type: rABS ? 'binary' : 'array'});

            data = toJSON(workbook);
            data.penalty = getFormattedPenalty(data.penalty);
            parseDataInt(data);
            sortWines(data.wines);

            winesMaxAmount = Math.max.apply(null, data.wines.map(w => w.amount));

            drawWinesChart(data.wines, winesMaxAmount);
            drawTanksStacked(data.tanks);
            displayComputeButton();
        };

        if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
    }

    function toJSON(workbook) {
        var result = {};
		workbook.SheetNames.forEach(function(sheetName) {
            var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
			if(roa.length) result[sheetName] = roa;
        });
		return result;
    };

    function getFormattedPenalty(penalties) {
        var formattedPenalty = {};
        penalties.forEach(function(p) {
            formattedPenalty[p.color] = p.penalty;
        });
        return formattedPenalty;
    }

    function parseDataInt(data) {
        for (var key in data.penalty) {
            if (data.penalty.hasOwnProperty(key)) {
                data.penalty[key] = parseInt(data.penalty[key]);
            }
        }

        data.tanks.forEach(function(tank) {
            tank['id'] = parseInt(tank['id']);
            tank['cap'] = parseInt(tank['cap']);
        });

        data.wines.forEach(function(wine) {
            wine['amount'] = parseInt(wine['amount']);
            wine['class'] = parseInt(wine['class']);
        });
    }

    function sortWines(wines) {
        wines.sort(function(a, b) {
            if (a.class > b.class) {
                return -1;
            }

            if (a.class < b.class) {
                return 1;
            }

            if (a.amount > b.amount) {
                return -1;
            }

            if (a.amount < b.amount) {
                return 1;
            }

            return 0;
        });
    }

    function displayComputeButton() {
        $('#btn-compute').css('display', '');
    }

    function displayTanksOptimaizedPanel() {
        $('#output-tanks-section').css('display', '');
    }

    function displayRemainsWinesPanel() {
        $('#output-wines-section').css('display', '');
    }

    function displayExportButton() {
        $('#btn-export-xlsx').css('display', '');
    }

    function setProgressBarToCompleted() {
        $("#btn-compute ~ .progress .progress-bar")
        .css('width',  '100%')
        .attr('aria-valuenow', 100)
        .html('100%')
        .removeClass('progress-bar-info')
        .removeClass('active')
        .removeClass('progress-bar-striped')
        .addClass('progress-bar-success');
    }

    function handleCompute() {
        var time_limit = parseInt($('#input-time-limit').val());

        var progressBar = $("#btn-compute ~ .progress");
        progressBar.css('display', '');

        // loading animation
        var currentProgress = 0;
        var timeInterval = 1000;
        var progressInterval = setInterval(function() {
            currentProgress += 100 * timeInterval / time_limit;
            if (currentProgress >= 100) {
                window.clearInterval(progressInterval);
                return;
            }

            $('.progress-bar', progressBar).css('width', currentProgress + '%');
            $('.progress-bar', progressBar).attr('aria-valuenow', currentProgress);
            $('.progress-bar', progressBar).html(Math.ceil(currentProgress) + '%');
        }, timeInterval);

        $.ajax({
            type: 'POST',
            url: 'http://localhost:5000/',
            data: JSON.stringify({
                data_form: data,
                time_limit: time_limit
            }),
            contentType: "application/json",
            success: function(_solution) {
                solution = _solution;
                setProgressBarToCompleted();
                displayTanksOptimaizedPanel();
                displayRemainsWinesPanel();
                drawTanksOptimized(solution, data);
                drawRemainsWinesChart(solution, data, winesMaxAmount);
                displayExportButton();
            },
            error: console.error
        });
    }

    function handleXlsxExport() {
        exportSolutionToXlsx(data, solution, 'solution');
    }

    document.getElementById('input-data-file').addEventListener('change', handleFile, false);
    document.getElementById('btn-compute').addEventListener('click', handleCompute, false);
    document.getElementById('btn-export-xlsx').addEventListener('click', handleXlsxExport, false);
})