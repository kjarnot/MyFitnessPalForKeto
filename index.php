<?php require('=/php-markdown/markdown.php'); ?>
<!DOCTYPE html>
<html lang="en-US">
<head>
	<meta charset="utf-8" />
	<title>MyFitnessPal for Keto</title>
	<link rel="apple-touch-icon" sizes="72×72" href="path/to/apple-touch-icon.png" />
		<!-- <link rel="apple-touch-startup-image" href="path/to/ipad-bg-portrait.png" media="(device-width: 768px) and (orientation:portrait)" /> -->
		<!-- <link rel="apple-touch-startup-image" href="path/to/ipad-bg-landscape.png" media="(device-width: 768px) and (orientation:landscape)" /> -->
	<!--retina-->
	<link rel="apple-touch-icon" sizes="144×144" href="path/to/a/apple-touch-icon@2x.png" />
		<!-- <link rel="apple-touch-startup-image" href="path/to/a/ipad-bg-portrait@2x.png" media="(device-width: 768px) and (orientation:portrait) and (-webkit-device-pixel-ratio: 2)" /> -->
		<!-- <link rel="apple-touch-startup-image" href="path/to/ipad-bg-landscape@2x.png" media="(device-width: 768px) and (orientation:landscape) and (-webkit-device-pixel-ratio: 2)" /> -->
	<!--/retina-->
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
	<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Rammetto+One" />
	<link rel="stylesheet" href="/=/style.css" type="text/css" />
</head>
<body><?php

	$uri = ($_GET['uri'] && file_exists(__DIR__ . DIRECTORY_SEPARATOR . $_GET['uri'] . '.md')) ? $_GET['uri'] : 'README.md';
	echo Markdown(file_get_contents($uri));

?></body>
</html>
