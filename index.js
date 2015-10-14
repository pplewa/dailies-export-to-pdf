var Evernote = require('evernote').Evernote;
var Promise = require('es6-promise').Promise;
var fs = require('fs');

var client = new Evernote.Client({
	token: process.env.TOKEN,
	sandbox: false
});

var noteStore = client.getNoteStore();

var filter = new Evernote.NoteFilter({
	words: 'notebook:journal intitle:(PDF)',
	order: Evernote.NoteSortOrder.CREATED,
	ascending: false
});
var noteSpec = new Evernote.NotesMetadataResultSpec({
	includeTitle: true
})
noteStore.findNotesMetadata(filter, 0, 2, noteSpec, function(error, data){
	if (error) {
		throw new Error(error);
	} else if (data.notes[0]) {
		getNote(data.notes[0].guid);
	}
});

function getNote(guid) {
	noteStore.getNote(guid, false, true, false, false, function(error, note){
		if (error) {
			throw new Error(error);
		}
		saveFileFromBytes(note.title, note.resources[0].data.body)
			.then(function() {
				noteStore.deleteNote(guid, function(err){
					if (err) {
						throw new Error(err);
					}
					console.log('all done');
				});
			});
	});
}

function saveFileFromBytes(title, bytes, callback) {
	return new Promise(function(resolve, reject) {
		var b = new Buffer(bytes);
		for (var i = 0; i < bytes.length; i++) {
		    b[i] = bytes[i];
		}
		fs.writeFile(title.replace(/\//g, '-') + '.pdf', b, 'binary', function(err) {
		    if (err) {
		        reject(err);
		    } else {
		        resolve();
		    }
		});
	});
}
