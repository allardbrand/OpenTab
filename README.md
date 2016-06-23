# OpenTab Widget

## Description
Automatically open a tab within a tab container based on the tab name or a microflow.

## Typical usage scenario
* Show a tab based on the state/phase of a certain object

## Features and limitations
*	Show a tab based on a (static) tab name
*	Show a tab based on a tab name which is retrieved from a microflow data source (either context based or without any context)

## Configuration
1.	Add the OpenTab widget within the default (!) tab page of your tab container
2.	Configure the OpenTab widget to either use a static tab name or a microflow as data source
3.	In case of a microflow, make sure the microflow returns a valid tab name to open