<html lang="de">

<head>
<link rel="stylesheet" href="style.aplan.css">
<link rel="stylesheet" href="pure-min.css">
<script src="aplan.lib.js"></script>
<title>Arbeitsplan - PureJS Version</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>

<body>
	
	<?php require_once("menu.php"); ?>
		
	<div class="main" id="content" class="container">
		<div id="messages"></div>
		<?php require_once("login.php"); ?>
		<?php require_once("pwchange.php"); ?>
		<?php require_once("workareas.php"); ?>
		<div id="userinfo"></div>
	</div>
	
	<?php require_once("footer.php"); ?> 
	
	<script type="text/javascript">
	
	document.addEventListener('DOMContentLoaded', (event) => {
		//the event occurred
		hide_everything();
		
		build_gui();
		
		attach_handlers();
	});
		
	</script>
</body>