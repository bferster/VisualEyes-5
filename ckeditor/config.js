CKEDITOR.editorConfig = function( config ) {
	config.resize_dir='both';
	config.width="100%";
	config.skin = 'moono-lisa';
	config.removePlugins = "elementspath"
	config.resize_enabled = false;

	config.toolbar =[
		{ name: 'clipboard', items : [ 'Source','PasteFromWord','-','Undo','Redo' ] },
		{ name: 'editing', items : [ 'SpellChecker', 'Scayt' ] },
		{ name: 'insert', items : ['Table','SpecialChar' ] },
		{ name: 'styles', items : [ 'Font','FontSize' ] },
		{ name: 'colors', items : [ 'TextColor','BGColor' ] },
		'/',
		{ name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
		{ name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote',
		'-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] },
		];
};
