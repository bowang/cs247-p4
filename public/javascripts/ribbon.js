function ribbon( context )
{
	this.init( context );
}

ribbon.prototype =
{
	context: null,

	mouseX: null, mouseY: null,

	painters: null,

	init: function( context )
	{
		this.context = context;
		this.context.globalCompositeOperation = 'source-over';

		this.mouseX = SCREEN_WIDTH / 2;
		this.mouseY = SCREEN_HEIGHT / 2;

		this.painters = new Array();
		
		for (var i = 0; i < 50; i++)
		{
			this.painters.push({ dx: SCREEN_WIDTH / 2, dy: SCREEN_HEIGHT / 2, ax: 0, ay: 0, div: 0.1, ease: Math.random() * 0.2 + 0.6 });
		}
	},
	
	destroy: function()
	{
		clearInterval(this.interval);
	},

	strokeStart: function( mouseX, mouseY )
	{
		this.mouseX = mouseX;
		this.mouseY = mouseY

		for (var i = 0; i < this.painters.length; i++)
		{
			this.painters[i].dx = mouseX;
			this.painters[i].dy = mouseY;
		}

		this.shouldDraw = true;
	},

	stroke: function( mouseX, mouseY )
	{
		this.mouseX = mouseX;
		this.mouseY = mouseY;
	},

	strokeEnd: function()
	{
	
	},

    update: function()
    {
        var i;

        this.context.lineWidth = BRUSH_SIZE;
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + BRUSH_PRESSURE + ")";

        for (i = 0; i < this.painters.length; i++)
        {
            this.context.beginPath();
/*
            console.log('from: ' + this.painters[i].dx + ', ' +  this.painters[i].dy);
            console.log('a: ' + this.painters[i].ax + ', ' +  this.painters[i].ay);
*/
            this.context.moveTo(this.painters[i].dx, this.painters[i].dy);
            this.painters[i].dx -= this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this.mouseX) * this.painters[i].div) * this.painters[i].ease;
            this.painters[i].dy -= this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this.mouseY) * this.painters[i].div) * this.painters[i].ease;
/*
            console.log('to: ' + this.painters[i].dx + ', ' +  this.painters[i].dy);
            console.log('a: ' + this.painters[i].ax + ', ' +  this.painters[i].ay);
*/
            this.context.lineTo(this.painters[i].dx, this.painters[i].dy);
            this.context.stroke();
        }
    }

}
