//ui-search 定义
$.fn.uiSearch = function(){
	var ui = $(this);
	
	$('.ui-search-selected',ui).on('click',function(){
		$('.ui-search-select-list').show();
		return false;
	});
	$('.ui-search-select-list-item',ui).on('click',function(){
		$('.ui-search-selected',ui).text($(this).text());
		$('.ui-search-select-list',ui).hide();
		return false;
	});
	$('body').on('click',function(){
		$('.ui-search-select-list').hide();
	});
	$('.ui-search-select-list').hide();
};

// ui-tab 定规

/**
 * [UiTab description]
 * @param {[string]} header  [TAB组件, 的所有选项卡 item]
 * @param {[string]} content [TAB组件，内容区域，所有item]
 * @option {[string]} focus_prefix 选项卡高亮样式前缀，可选
 */
$.fn.uiTab = function(header,cons,focus_prefix){
	var ui = $(this);
	var tabs = $(header,ui);
	var cons = $(cons,ui);
	var focus_prefix = focus_prefix || '';

	tabs.on('click',function(){
		var index = $(this).index();
		tabs.removeClass(focus_prefix+'item_focus').eq(index).addClass(focus_prefix+'item_focus');
		cons.hide().eq(index).show();
		return false;
	});
};

//ui-backTop
$.fn.UiBackTop = function(){
	var ui = $(this);
	var el = $('<a class="ui-backTop" href="#0"></a>');
	ui.append(el);

	var windowHeight = $(window).height();
	$(window).on('scroll',function(){
		var top = $('body').scrollTop();
		if(top>windowHeight){
			el.show();
		}else{
			el.hide();
		}
	});
	el.on('click',function(){
		$(window).scrollTop(0);
	});
};

//ui-slider
// 1.左右箭头需要能控制翻页
// 2.翻页的时候，进度点，要联动进行focus
// 3.翻到第三页的时候，下一页需要回到第一页，翻到第一页的时候，同理
// 4.进度点，在点击的时候，需要切换到对应的页面
// 5.没有进度点点击、翻页的时候需要进行自动滚动。
// 6.滚动过程中，屏蔽其他操作（自动滚动、左右翻页、进度点点击）

$.fn.uiSlider  =function(){
	var ui = $(this);
	var wrap =  $('.ui-slider-wrap',ui);
	var size = $('.item',wrap).size()-1;
	

	var goPrev = $('.ui-slider-arrow .left',ui);
	var goNext = $('.ui-slider-arrow .right',ui);

	var items = $('.item',wrap);
	var tips  = $('.ui-slider-process .item',ui);
	var width =  items.eq(0).width();

	var currentIndex = 0;
	var autoMove = true;

	//鼠标移入停止，移出轮播
	ui
	.on('mouseover',function(){
		autoMove = false;
	})
	.on('mouseout',function(){
		autoMove = true;
	})

	//	1.基本事件
	wrap
	.on('resetFocus',function(evt,isAutoMove){

		// if(autoMove === true &&)

		tips.removeClass('item_focus').eq(currentIndex).addClass('item_focus');
		wrap.animate({left:currentIndex*width*-1});
	})
	.on('nextFocus',function(){

		currentIndex = currentIndex+1 > size ? 0 : currentIndex+1;
		$(this).triggerHandler('resetFocus');

		// 4. 链式调用
		return $(this);

	})
	.on('prevFocus',function(){
		currentIndex = currentIndex-1 < 0 ? size : currentIndex-1;
		$(this).triggerHandler('resetFocus');

	})
	/*.on('autoMove',function(){
		// 2. 自动处理
		if(autoMove == true){
			setTimeout(function(){
				// 3. 闭包 && 链式调用
				wrap.triggerHandler('nextFocus').triggerHandler('autoMove');
			},5000);
		}
	}).triggerHandler('autoMove');*/

	.on('auto_move',function(){
		setInterval(function(){
			autoMove && wrap.triggerHandler('nextFocus');
		},3000);
	})
	.triggerHandler('auto_move');


	goPrev.on('click',function(){
		wrap.triggerHandler('prevFocus');
		return false;
	});
	goNext.on('click',function(){
		wrap.triggerHandler('nextFocus');
		return false;
	});

	//	5.任务 BUG 排除（定时器BUG	）

}


//	从远程获得数据（一般在后台处理）
var getData = function(k,v){

	//	初始化获取所有城区
	if( k === undefined){
		return [{id:1,name:'东城区'},{id:2,name:'西城区'}];
	}
	//	根据城区获得下面的等级（不同城区相同等级的 id 不一样）
	if( k === 'area' ){
		var levelData = {
			1:[  {id:11,name:'一级医院'},{ id:12,name:'二级医院'} ],
			2:[  {id:22,name:'二级医院'} ]
		}
		return levelData[v] || [];
	}
	//	根据等级获取医院
	if( k === 'level'){
		var hospital = {
			11 : [  {id:1,name:'A1医院'},{id:2,name:'A2医院'} ],
			12 : [  {id:3,name:'B1医院'} ],
			22 : [  {id:4,name:'C1医院'},{id:5,name:'C2医院'} ]

		}

		return hospital[v] || [];

	}
	//	根据名称获取科室（科室都是依附在医院下面的）
	if( k === 'name'){
		var department = {
			1 : [  {id:1,name:'骨科'},{id:2,name:'内科'} ],
			2 : [  {id:3,name:'儿科'} ],
			3 : [  {id:4,name:'骨科'},{id:5,name:'内科'} ],
			4 : [  {id:6,name:'儿科'} ],
			5 : [  {id:7,name:'骨科'},{id:8,name:'内科'} ]

		}

		return department[v] || [];
	}
	return [];
}


$.fn.uiCascading = function(){

	//	每个select更新，就清理后面所有 select 为初始化状态
	//	并且根据当前 select 的值，获得下一个 select 的数据，并且更新
	var ui = $(this);
	var listSelect = $('select',this);


	//	每个select
	listSelect

		.on('updateOptions',function(evt,ajax){
			
			var select = $(this);

			select.find('option[value!=-1]').remove();
			if(ajax.data.length<1){
				return true;
			}
			for(var i=0,j=ajax.data.length;i<j;i++){
				var k = ajax.data[i].id;
				var v = ajax.data[i].name;
				select.append( $('<option>').attr('value',k).text(v) );
			}
			return true;
		})
		.on('change',function(){

			var changeIndex = listSelect.index(this);

			var k = $(this).attr('name');
			var v = $(this).val();

			var data  = getData(k,v);

			listSelect.eq(changeIndex+1).triggerHandler('updateOptions',{ data:data });
			
			ui.find('select:gt('+(changeIndex+1)+')').each(function(){
				$(this).triggerHandler('updateOptions',{ data:[] });	
			})
		})


		//	初始化
		listSelect.find('option:first').attr('value','-1');	//	特殊初始值标记

		listSelect.eq(0).triggerHandler('updateOptions',{ data:getData() }); // apply 传参


}


//页面的脚本逻辑
$(function(){
	$('.ui-search').uiSearch();
	$('.content-tab').uiTab('.caption > .item','.block > .item');
	$('.content-tab .block .item').uiTab('.block-caption > a','.block-wrap','block-caption-');

	$('body').UiBackTop();

	$('.ui-slider').uiSlider();
	$('.ui-cascading').uiCascading();
})