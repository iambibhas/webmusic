<?php
require_once 'app/include.php';
require_once 'app/utils.php';
require_once 'app/cache.inc.php';
?><!DOCTYPE html>
<html lang="fr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="shortcut icon" type="image/png" href="images/favicon.png" />
<link rel="stylesheet" type="text/css" href="css/jquery-ui-1.8.16.custom.css" />
<link rel="stylesheet" type="text/css" href="css/jquery.tooltip.css" />
<link rel="stylesheet" type="text/css" href="css/jquery.loadmask.css" />
<link rel="stylesheet" type="text/css" href="css/jquery.jgrowl.css" />
<link rel="stylesheet" type="text/css" href="css/jquery.contextmenu.css" />
<link rel="stylesheet" type="text/css" href="css/global.css" />
<link rel="stylesheet" type="text/css" href="css/player.css" />
<script type="text/javascript" src="js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
<script type="text/javascript" src="js/utils.js"></script>
<script type="text/javascript" src="js/jquery.store.js"></script>
<script type="text/javascript" src="js/jquery.playlist.div.js"></script>
<script type="text/javascript" src="js/jquery.playlist.js"></script>
<script type="text/javascript" src="js/jquery.player.js"></script>
<script type="text/javascript" src="js/jquery.recipient.js"></script>
<script type="text/javascript" src="js/jquery.tooltip.js"></script>
<script type="text/javascript" src="js/jquery.loadmask.min.js"></script>
<script type="text/javascript" src="js/jquery.jgrowl.min.js"></script>
<script type="text/javascript" src="js/jquery.contextmenu.js"></script>
<script type="text/javascript" src="js/jquery.fastsearch.js"></script>
<script type="text/javascript" src="js/jquery.shortcuts.min.js"></script>
<script type="text/javascript" src="js/soundmanager2<?php if(!Config::get('debug', 'debug')){echo '-nodebug';} ?>-jsmin.js"></script>
<script type="text/javascript">
//<![CDATA[
	soundManager.url = '<?php echo Config::get('soundmanager', 'url'); ?>';
	soundManager.flashVersion = <?php echo Config::get('soundmanager', 'flashVersion'); ?>;
	soundManager.useFlashBlock = <?php echo Config::get('soundmanager', 'useFlashBlock')?"true":"false"; ?>;
	soundManager.useHTML5Audio = <?php echo Config::get('soundmanager', 'useHTML5Audio')?"true":"false"; ?>;
	soundManager.preferFlash = <?php echo Config::get('soundmanager', 'preferFlash')?"true":"false"; ?>;
//]]>
</script>
<script type="text/javascript" src="js/menu.js"></script>
<script type="text/javascript" src="js/ajax.js"></script>
<script type="text/javascript" src="js/init.js"></script>
<title>Webmusic</title>
</head>
<body>
	<div id="body">
		<div id="header">
			Webmusic
		</div>
		<div id="left_pane" class="ui-widget ui-widget-content">
			<div id="search">
				<p>
					<input id="input_artist" type="text" placeholder="Quick artist search" autocomplete="off" />
				</p>
			</div>
			<div class="wrapper">
			<?php
			Cache::printMenu();
			?>
			</div>
			<script type="text/javascript">
			//<![CDATA[
				loadAjaxMenu();
			//]]>
			</script>
		</div>
		<div id="body2">
			<div id="body2_wrapper">
				<div class="pane">
					<ul><li><a href="#tabs-albums">Albums</a></li></ul>
					<div id="tabs-albums">
						<div class="container">
						</div>
					</div>
				</div>
			</div>
		</div>
		<div id="right_pane" class="ui-widget ui-widget-content">
			<div class="wrapper"><ul></ul></div>
		</div>
		<div class="push"></div>
	</div>
	<div id="footer">
		<?php include 'player.html'; ?>
	</div>
</body>
</html>