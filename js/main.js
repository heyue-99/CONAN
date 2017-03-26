
/*柯南海报页*/
    //翻转事件
     /*翻面控制，每个元素的 onclick() 事件都绑定此函数，如果点击的元素不是中间的海报，则取得其id 进行重新排序，使其在中间显示；如果点击的是中间的海报则让它翻面，同时控制按钮也要翻面 */
	function turn(elem){
		var cls=elem.className;
		var n=elem.id.split('_')[1]

        //将当前点击的图像n传到posterSort(n)中
		if(!/photo_center/.test(cls)){
			return posterSort(n);   //如果不是翻转中间一个 便不进行后续动作 直接到posterSort()函数
		}

		if(/photo_front/.test(cls)){                       //cls中是否存在photo_front
			cls=cls.replace(/photo_front/,'photo_back');    //不能直接传值 会覆盖原有的className 要替换
			//将按钮图标的样式也改变
			g('#nav_'+n).className+=' i_back ';  //同时处理控制按钮
		}else {
			cls=cls.replace(/photo_back/, 'photo_front');
			g('#nav_'+n).className=g('#nav_'+n).className.replace(/\s*i_back\s*/,' '); //同时处理控制按钮
		}
		return elem.className=cls;
	}

	//通用函数
	function g(selector){
		var method=selector.substr(0,1)=='.'?'getElementsByClassName':'getElementById';
		return document[method](selector.substr(1));
	}

	//随机取值 支持自己设定取值范围 前后不分大小
	/*随机数生成函数，在给定的范围内(random([min, max]))随机生成一个值，
     *因为要在 20 张海报中随机选取一张居中显示，以及在左右两个分区内随机摆放
      剩余海报，因为海报数量和左右区域都是有限制的，所以必须在给定范围内生成随机数。
     *传入的参数 range 是一个包含两个数值的数组，这两个数值即是给定范围的最小值(包含)和最大值(包含)
     *Math.random() 随机生成介于 0.0 ~ 1.0 之间的一个伪随机数*/
	function random(range){
		var min=Math.min(range[0],range[1]);
		var max=Math.max(range[0],range[1]);
		var dif=max-min;
		var number=Math.round(Math.random()*dif+min);
		return number;
	}

	//输出所有海报
	var photo_data=photo_data;   //photo_data是photo_data.js中的photo_data数组
	function addPhoto(){
		var temp=g('#wrap_photo').innerHTML;
		var html=[];
		var nav=[];

		//将HTML中模板字符串换为data.js中的数据
		//输出控制按钮 每一个控制按钮对应一个海报
		for(s in photo_data){  //replace方法返回交换后的一个新的字符串
			var oHtml=temp.replace('{index}',s).replace('{image}',photo_data[s].src).replace('{caption}',photo_data[s].caption).replace('{desc}',photo_data[s].desc);
			html.push(oHtml);
			nav.push('<span id="nav_'+s+'" onclick="turn(g(\'#photo_'+s+'\'))" class="i"></span>');
		}

		html.push('<div class="nav">'+nav.join('')+'</div>');

		g('#wrap_photo').innerHTML=html.join(''); //数组化为字符串 默认为逗号连接
		posterSort(random([0,photo_data.length-1]));  //传递数组
	}
	addPhoto();

	//海报排序
	function posterSort(n){
		var _photo=g('.photo');
		var photo=[];
		for(s=0;s<_photo.length;s++){
			//将各种类去掉 因为点击的图片将到中间去 其余的图片位置都会改变
			_photo[s].className=_photo[s].className.replace(/\s*photo_center\s*/,' ');
			_photo[s].className=_photo[s].className.replace(/\s*photo_back\s*/,' ');
			_photo[s].className=_photo[s].className.replace(/\s*photo_front\s*/,' ');
			_photo[s].className+=' photo_front';
			_photo[s].style.left='';
            _photo[s].style.top='';	
            //中心缩放1.3
            _photo[s].style['transform'] = _photo[s].style['-webkit-transform'] = 'rotate(0deg) scale(1.2)';		

			photo.push(_photo[s]);
		}
		var posterCenter=g('#photo_'+n);
		posterCenter.className+=' photo_center'; //在浏览器查看器中发现少一个空格
		posterCenter=photo.splice(n,1)[0]; //把photo_center从数组里删掉，splice() 方法会改变原始数组
		//将海报分为左右两个区域
		var ranges=range()  //不能和函数同名 
		photo_left=photo.splice(0,Math.ceil(photo.length/2));
		photo_right=photo;
		// 对左右区域的海报位置进行随机赋值
		for(s in photo_left){
			var photo=photo_left[s];
			photo.style.left=random(ranges.left.x)+'px';
			photo.style.top=random(ranges.left.y)+'px';
			//左右缩放0.8
			photo.style['transform'] = photo.style['-webkit-transform'] = 'rotate(' + random([-150, 150]) + 'deg) scale(0.8)';
			//photo.style.transform='rotate(' + random([-150, 150]) + 'deg) scale(1)';
		}

		for(s in photo_right){
			var photo=photo_right[s];
			photo.style.left=random(ranges.right.x)+'px';
			photo.style.top=random(ranges.right.y)+'px';
			photo.style['transform'] = photo.style['-webkit-transform'] = 'rotate(' + random([-150, 150]) + 'deg) scale(0.8)';
		}

		//控制按钮处理
		var navs=g('.i');
		for(var s=0;s<navs.length;s++){
			navs[s].className=navs[s].className.replace(/\s*i_current\s*/,' ');
			navs[s].className=navs[s].className.replace(/\s*i_back\s*/,' ');
		}
		g('#nav_'+n).className+=' i_current '; //前后空格
	}

    //计算左右分区的范围 使其他海报的显示不会超出此范围
    /*{left: {x: [左侧区域 left 的最小值, 左侧区域 left 的最大值], y: [左侧区域 top 的最小值, 左侧区域 top 的最大值]}, 
     *right: {x: [右侧区域 left 的最小值, 右侧区域 left 的最大值], y: [右侧区域 top 的最小值, 右侧区域 top 的最大值]}} */
	function range(){
		var range={left:{x:[],y:[]},right:{x:[],y:[]}};
		//获取最外围容器的宽度和高度
		var wrap={
			w:g('#wrap_photo').clientWidth,
			h:g('#wrap_photo').clientHeight
		}
		//获取每一张海报的宽度和高度，因为海报的大小都是一样的，所以取第一张
		var photo={
			w:g('.photo')[0].clientWidth,
			h:g('.photo')[0].clientHeight
		}
		range.wrap=wrap;
		range.photo=photo;

        //按照自己想要显示的区域进行计算，左右区域的高度 (top) 范围是一样的
		range.left.x = [0 , wrap.w / 2- photo.w];
        range.left.y = [0 , wrap.h];
        range.right.x = [wrap.w / 2+photo.w , wrap.w];
        range.right.y = range.left.y;

		return range;
	}

    /*电影介绍*/
   var time_data=data;
    addContent ();
    //HTML模板替换
    function addContent () {
        var temp=g('#wrap').innerHTML;
        var ohtml=[];
        var _html=[];

        for(s in time_data){
            _html=temp.replace('{index}',s).replace('{year}',time_data[s].year).replace('{month}',time_data[s].month).replace('{date}',time_data[s].date).replace('{intro}',time_data[s].intro)
            ohtml.push(_html);
        }
        g('#wrap').innerHTML=ohtml.join('');
    }
    
    //绑定在左侧年份条的点击事件上
    function show(index){
        var year=g('#content_'+index);
        var dTop=year.offsetTop+800;
        toYear(dTop);
        changeColor(index);
    }

    function toYear(to){
        window.scrollTo(0,to);
    }   

    //页面滚动条滚动事件 使左侧年份条一定情况下固定
    window.onscroll=function(){
        var top=document.documentElement.scrollTop || document.body.scrollTop; 
        update(top);
        var scrubber=g('#scrubber');
        if(top>800&&top<2600){
            scrubber.style.position='fixed';
            scrubber.style.top='100px';
            scrubber.style.left=(document.body.clientWidth-960)/2+'px';
        }else {
            scrubber.style.position='';
            scrubber.style.top='';
            scrubber.style.left='';    //直接赋空 就恢复默认值
        }
    }
    
    //传入当前的scrollTop 随页面滚动更新左侧年份栏
    function update(top){
        var years=g('.content');
        var tops=[];
        //将右侧每个content的offsetTop传入数组
        for(var i=0;i<years.length;i++){
            tops.push(years[i].offsetTop+600);
        }
        //如果当前scrollTop在第i-1和i个content中间 高亮对应左侧年份颜色
        for(var i=1;i<tops.length;i++){
            if(top>tops[i-1]&&top<tops[i]){
                changeColor(i-1);
            }
            if(top>tops[i]){
                changeColor(i);
            }
        }
    }
    
    //使左侧年份栏随页面滚动高亮不同的年份
    function changeColor(a){
        var year=g('.scrubber_year');
        for(var i=0;i<year.length;i++){
            //replace不会改变数组 必须赋值回去 不能直接g('.scrubber_year')[i].className.replace(/\s*current\s*/,'')这样并不会改变数组;
            g('.scrubber_year')[i].className=g('.scrubber_year')[i].className.replace(/\s*current\s*/,'');
        }
        g('.scrubber_year')[a].className+=' current ';
    }



    window.onload=function(){
    waterfall();
    getMask();
}

function waterfall(){
    var oBox=[];
    var oMain=document.getElementById("main");
    oBox=document.getElementsByClassName("box");
    var oBoxw=oBox[0].offsetWidth;
    //一行有几列图片组成
    var cols=Math.floor(document.documentElement.clientWidth/oBoxw);
    //居中 放大缩小窗口 不会响应大小
   // oMain.style.cssText='width:'+oBoxw*cols+'px;margin:0 auto';//css样式以字符串的形式设置
   
    //先将第一行六列排放 依次选择总高度最小的一列放置下一张图片
    var hArr=[];
    for(var i=0;i<oBox.length;i++){
        if(i<cols){
            hArr.push(oBox[i].offsetHeight);
        }else{
            //min不能用于数组，apply的第一个参数传递作用域，第二个参数传递数组。Math.min.apply(null, [1, 2, 3]) 等价于 Math.min(1, 2, 3)
            var minH=Math.min.apply(null,hArr);
            var index=getminHIndex(minH,hArr);
            oBox[i].style.position='absolute';
            oBox[i].style.top=minH+'px';
            oBox[i].style.left=index*oBoxw+'px';
            hArr[index]+=oBox[i].offsetHeight;
        }

    }
}

function getminHIndex(num,arr){
    for(var i=0;i<arr.length;i++){
        if (arr[i]==num) 
            return i
    }
}

//使mask的高度和image一样 并且点击产生模态对话框
function getMask(){
    var mask=g('.mask');
    var image=[];
    for(var i=0;i<mask.length;i++){
        image.push(mask[i].getElementsByTagName('img')[0]);
    }   
    //在第一个循环里加上image[i].index=i; openNew函数传参this.index 避免最后一直传参图片最大的数目
    for(var i=0;i<mask.length;i++){
        mask[i].style.height=image[i].offsetHeight+"px";
        image[i].index=i;
        image[i].onclick = function() {   
            openNew(this.index);
            return false;
        }
    }
}

var modal_data=modal_data;
function openNew(i){
    //获取页面的高度和宽度
    var pHeight=document.body.scrollHeight;
    var pWidth=document.body.scrollWidth;
    //获取页面的可视区域高度和宽度
    var oHeight=document.documentElement.clientHeight;

    var oMask=document.createElement("div");
    oMask.id="mask";
    oMask.style.width=pWidth+'px';
    oMask.style.height=pHeight+'px';
    document.body.appendChild(oMask);

    var oLogin=document.createElement("div");
    oLogin.id="login";
    oLogin.innerHTML="<div class='loginCon'><div class='loginHead'><p></p><div id='close'>点击关闭</div></div><div class='loginContext'><p></p></div><div class='loginFooter'><button>关闭</button></div></div>"
    document.body.appendChild(oLogin);

    var loginHead=g('.loginHead')[0];
    var loginContext=g('.loginContext')[0];
    loginHead.getElementsByTagName('p')[0].innerHTML='';
    loginContext.getElementsByTagName('p')[0].innerHTML='';
    loginHead.getElementsByTagName('p')[0].innerHTML=modal_data[i].head;
    loginContext.getElementsByTagName('p')[0].innerHTML=modal_data[i].context;


    //获取登陆框的宽和高
    var dHeight=oLogin.offsetHeight;
    var dWidth=oLogin.offsetWidth;
    //设置登陆框的left和top
    oLogin.style.left=pWidth/2-dWidth/2+'px';
    oLogin.style.top=oHeight/2-dHeight/2+'px';

    var oClose=document.getElementById("close");
    var oButton=document.getElementsByTagName("button")[0];
    
        //点击登陆框以外的区域也可以关闭登陆框
    oClose.onclick=oMask.onclick=oButton.onclick=function(){
                document.body.removeChild(oLogin);
                document.body.removeChild(oMask);
        };
}
