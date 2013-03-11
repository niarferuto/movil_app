/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/
var movilApp = {
	gatewayURL : 'http://niarfeapps.my.phpcloud.com/mobile_app_service',
	
	crop_state : false,
	
	user : null,
	
	jCropApi : null,
	
	verifySession : function(){
		jQuery.mobile.showPageLoadingMsg('Loading');
		$.ajax({
			url : movilApp.gatewayURL + '/sesion',
			cache : false,
			type : 'GET',
			success : function(data, status, xhr) {
				jQuery.mobile.hidePageLoadingMsg();
				if (!data.error) {
					if (data.data.error) {
						alert("Mensaje Secundario: " + data.data.mensaje);
					} else {
						movilApp.setDataUser(data.data.data);
						$.mobile.changePage($("#page4"), {});
					}
				} else {
					alert("Mensaje Principal: "+data.mensaje);
					if (data.data != null) {
						alert("Mensaje Secundario: " + data.data.mensaje);
					}
				}
			}
		});
	},
	
	registry : function(e){
		e.preventDefault();
		jQuery.mobile.showPageLoadingMsg('Loading');
		$.ajax({
			url : movilApp.gatewayURL + '/registro',
			cache : false,
			type : 'POST',
			data: $(this).serialize(),
			success : function(data, status, xhr) {
				jQuery.mobile.hidePageLoadingMsg();
				if (data.error) {
					alert(data.mensaje);
				} else {
					alert(data.mensaje);
					movilApp.setDataUser(data.data.data);
					$.mobile.changePage($("#page4"), {});
				}
			}
		});
	},
	
	login : function(e){
		e.preventDefault();
		jQuery.mobile.showPageLoadingMsg('Loading');
		$.ajax({
			url : movilApp.gatewayURL + '/login',
			cache : false,
			type : 'POST',
			data: $(this).serialize(),
			success : function(data, status, xhr) {
				jQuery.mobile.hidePageLoadingMsg();
				if (data.error) {
					alert(data.mensaje);
				} else {
					alert(data.mensaje);
					movilApp.setDataUser(data.data.data);
					$.mobile.changePage($("#page4"), {});
				}
			}
		});
	},
	
	logout : function(e){
		e.preventDefault();
		jQuery.mobile.showPageLoadingMsg('Loading');
		$.ajax({
			url : movilApp.gatewayURL + '/logout',
			cache : false,
			type : 'GET',
			success : function(data, status, xhr) {
				jQuery.mobile.hidePageLoadingMsg();
				movilApp.user = {};
				alert(data.mensaje);
				$.mobile.changePage($("#page1"), {});
			}
		});
	},
	
	setDataUser : function(data){
		movilApp.user = {
			'userName' : data.email,
			'nombres' : data.nombres,
			'apellidos' : data.apellidos
		};
		$("#user_name").html(movilApp.user.userName);
		$("#nombre").html(movilApp.user.nombres);
	},
	
	screenChange : function(){
		if (movilApp.crop_state) {
			movilApp.cancelCrop();
			$("#active-crop").removeClass("ui-btn-active");
		}
	},
	
	getPic : function(){
		navigator.camera.getPicture(
				movilApp.dumpPic, 
				movilApp.failPic,
				{ 
					quality : 75, 
					destinationType : Camera.DestinationType.FILE_URI, 
					sourceType : Camera.PictureSourceType.CAMERA, 
					allowEdit : true,
					encodingType: Camera.EncodingType.PNG
				}
			);
	},
	
	confirmPic : function(){
		
		if (movilApp.crop_state) {
			var trueSize = movilApp.jCropApi.tellSelect();
			var width = trueSize.w;
			var height = trueSize.h;
			var canvas = $("#preview-pic")[0];
			var image = encodeURIComponent(canvas.toDataURL("image/png"));

			$.ajax({
				url : movilApp.gatewayURL + '/savepic',
				data: "width="+width+"&height="+height+"&dataimg="+image,
				cache : false,
				type : 'POST',
				success : function(data, status, xhr) {
					if (data.error) {
						alert(data.mensaje);
					}
				}
			});
			
			movilApp.crop_state = false;
			movilApp.jCropApi.destroy();
			$.mobile.changePage($("#page4"), {});
		} else {
			alert("Debe seleccionar un area.");
		}
	},
	
	cancelPic : function(){
		$.mobile.changePage($("#page4"), {});
		
		if (movilApp.crop_state) {
			movilApp.crop_state = false;
			movilApp.jCropApi.destroy();
		}
		$("#target").attr("style","");
		$("#target").attr("src","");
		$("#target2").attr("src","");
	},
	
	dumpPic : function(data){
		$("#target").attr("src",data);
		$("#target2").attr("src",data);
		$.mobile.changePage($("#page5"), {});
	},
	
	failPic : function(){
		alert("Ocurrio un error al seleccionar la foto.");
	},
	
	ajaxErrorHandler: function(xhr, ajaxOptions, thrownError, exception) {
		jQuery.mobile.hidePageLoadingMsg();
		var msg = 'Ajax error. ';
		if (ajaxOptions.statusText != null && ajaxOptions.statusText != '')
			msg = msg + '<br/>' + ajaxOptions.statusText + '<br/>';
		
		alert(msg);
		movilApp.printObject(xhr);
		movilApp.printObject(ajaxOptions);
		movilApp.printObject(thrownError);
		movilApp.printObject(exception);
	},
	
	printObject : function(o){
		var salida = '';
		  for (var p in o) {
		    salida += p + ': ' + o[p] + '\n';
		  }
		  alert(salida);
	},
	
	activateCrop : function(){
		movilApp.crop_state = true;
		var realWidth = $("#target2").width();
		var realHeight = $("#target2").height();
		
		$("#target").Jcrop({
			onChange : movilApp.updatePreview,
			onSelect :movilApp.updatePreview,
			aspectRatio : 1,
			keySupport: false,
			trueSize: [realWidth,realHeight]
			},
			function() {
				movilApp.jCropApi = this;
				movilApp.jCropApi.animateTo([ 0,0,70,70 ]);
			}
		);
	},
	
	updatePreview : function(c){
		if(parseInt(c.w) > 0) {
			// Show image preview
			var imageObj = $("#target")[0];
			var canvas = $("#preview-pic")[0];
			var context = canvas.getContext("2d");
			context.drawImage(imageObj, c.x, c.y, c.w, c.h, 0, 0, canvas.width, canvas.height);
		}
	},
	
	cancelCrop : function(){
		if (movilApp.crop_state) {
			movilApp.crop_state = false;
			movilApp.jCropApi.destroy();
		}
		$("#target").attr("style","");
	}
};

document.addEventListener("deviceready",onDeviceReady,false);

window.onorientationchange = movilApp.screenChange;

function onDeviceReady() {
	$(document).ready(function () {
		jQuery.support.cors = true;
		
		$(document).ajaxError(movilApp.ajaxErrorHandler);
		movilApp.verifySession();	
		$('#form_regis').bind('submit', movilApp.registry);
		$('#form_login').bind('submit', movilApp.login);
		$('#logout').bind('click', movilApp.logout);
		$('#get_pic').bind('click', movilApp.getPic);
		$('#confirm-pic').bind('click', movilApp.confirmPic);
		$('#cancel-pic').bind('click', movilApp.cancelPic);
		$('#active-crop').bind('click', movilApp.activateCrop);
	});
}