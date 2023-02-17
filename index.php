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

	<div class="main pure-g">
		<div id="messages" class="pure-u-1"></div>

		<div class="pure-u-1">
				<?php require_once("login.php"); ?>
		</div>

		<div class="pure-u-1">
			<?php require_once("pwchange.php"); ?>
		</div>

		<div class="pure-u-1">
			<?php require_once("workareas.php"); ?>
		</div>

		<div id="dynamic_content" class="pure-u-1"></div>

		<div id="userinfo" class="pure-u-1"></div>

		<?php require_once("footer.php"); ?>
	</div>



	<script type="text/javascript">

	document.addEventListener('DOMContentLoaded', (event) => {
		//the event occurred
		hide_everything();
		build_gui();
		attach_handlers();
	});

	</script>
</body>
