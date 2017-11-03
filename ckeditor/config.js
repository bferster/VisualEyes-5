CKEDITOR.editorConfig = function( config ) {
	config.resize_dir='both';
	config.width="100%";
	config.skin = 'moono-lisa';
	config.removePlugins = "elementspath"
	config.resize_enabled = false;

	config.toolbar =[
		{ name: 'clipboard', items : [ 'Source','Undo','Redo' ] },
		{ name: 'editing', items : [ 'SpellChecker', 'Scayt' ] },
		{ name: 'insert', items : ['Table','SpecialChar','HorizontalRule','Image','Link'] },
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','RemoveFormat',
			'NumberedList','BulletedList','Outdent','Indent',
			'JustifyLeft','JustifyCenter','JustifyRight', ] },
		{ name: 'styles', items : [	'-','Styles','Font','FontSize','TextColor' ] },
		];
};
