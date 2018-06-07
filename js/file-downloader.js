function s2ab(s) {
	if(typeof ArrayBuffer !== 'undefined') {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	} else {
		var buf = new Array(s.length);
		for (var i=0; i!=s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}
}

function exportSolutionToXlsx(data, solution, filename) {
    var aoa = [['Tank id', ...data.wines.map(w => w.name)]].concat(solution.map((s, i) => [data.tanks[i].id, ...s]));
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'solution');
    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    var fname = (filename || 'solution') + '.xlsx';
    try {
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), fname);
    } catch(e) {
        if(typeof console != 'undefined') console.log(e, wbout);
    }
    return wbout;
}
