

var ctx, maze_size= 15, room_size= 50;
var current;
var cell_grid= [], stack= [];
var player;
var brick_img;
var moving= 0, moving_speed= 5;
var ang_moving= 0, ang_moving_speed= 9;// it should devide 90;
var jump_angle_speed= 10; //it should devide 90 too


function preload() {
	brick_img= loadImage("res/brick.jpg");
}


function setup() {
	ctx= createCanvas(600, 600, WEBGL);
	for(var i=0; i<maze_size; i++) {
		for(var j=0; j<maze_size; j++) {
			var cell= new Cell(i, j);
			cell_grid.push(cell);
		}
	}
	current= cell_grid[0];

	create_maze();

	background(175);

	//player= new Walker(maze_size-1, maze_size-1);
	//player= new Walker(maze_size-1, maze_size-1);
	player= new Walker(0, 1);
}


function draw() {

	clear();

	background(175);
	noStroke();

	translate(-width/2, -height/2);

	//normalMaterial();
	ambientMaterial(245, 124, 25, 255);
	//noStroke();
	//stroke(0);
	strokeWeight(2);
	//pointLight(0, 0, 255, 0, 0, 200);
	//ambientLight(225);
	//pointLight(255,255,255,0,0,0);
	//camera(300, 0, (height/2)/ tan(PI/6), 0, 0, 0, 0, 1, 0);
	perspective(PI/3, width/height, ((height/2)/ tan(PI/6))/100 , ((height/2)/ tan(PI/6))*10 );
	//pointLight(255, 255, 255, (player.i*room_size + room_size/2), (player.j*room_size + room_size/2), 25);

	player.set_view();
	player.check_win();

	for(var i=0; i<cell_grid.length; i++) {
		cell_grid[i].show();
	}

	if(moving< 0)
		moving+= moving_speed;
	else if(moving> 0)
		moving-= moving_speed;

	if(ang_moving< 0)
		ang_moving+= ang_moving_speed;
	else if(ang_moving> 0)
		ang_moving-= ang_moving_speed;

	if(player.jump) {
		if(player.jumping_cos_angle>90) {
			player.jumping_cos_angle= 90;
			player.jumping_up= false;

		}
		else if(player.jumping_up) {
			player.jump_height= room_size* Math.sin(player.jumping_cos_angle*Math.PI/180);
			player.jumping_cos_angle+= jump_angle_speed;
		}
		else {
			player.jump_height= room_size* Math.sin(player.jumping_cos_angle*Math.PI/180);
			player.jumping_cos_angle-= jump_angle_speed;
			if(player.jumping_cos_angle< 0) {
				player.jumping_cos_angle= 0;
				player.jump_height= 0;
				player.jump= false;
			}
		}
	}

	console.log(player.jumping_cos_angle);

}

function keyPressed() {

	console.log(keyCode);

	if(moving || ang_moving || player.jump) {
		return ;
	}
	else if(keyCode== 39) {
		player.view_point= (player.view_point+1)%4;
		ang_moving= -90;
	}
	else if(keyCode== 37) {
		player.view_point= player.view_point-1;
		if(player.view_point== -1)
			player.view_point= 3;
		ang_moving= 90;
	}
	else if(keyCode== 38) {
		if(player.go_forward()) {
			moving= -room_size;
		}
	}

	else if(keyCode== 40) {
		if(player.go_backward()) {
			moving= room_size;
		}
	}
	else if(keyCode== 32) {
		player.jump= true;
		player.jumping_up= true;
	}
}



function create_maze() {
	while(current) {
		current.visited=true;
		var next= current.cheak_neighbors();
		if(next) {
			next.visited= true;
			stack.push(current);
			remove_wall(current, next);
			current= next;
		}
		else if(stack.length>0)
			current= stack.pop();
		else {
			current= null;
			next= null;
		}
	}
}




function Cell(i, j) {
	this.i= i;
	this.j= j;
	this.walls= [true, true, true, true];
	this.visited= false;


	this.cheak_neighbors= function() {
		var neighbors= [];


		var top= cell_grid[index(i, j-1)];
		var right= cell_grid[index(i+1, j)];
		var bottom= cell_grid[index(i, j+1)];
		var left= cell_grid[index(i-1, j)];

		if(top && !top.visited) {
			neighbors.push(top);
		}
		if(bottom && !bottom.visited) {
			neighbors.push(bottom);
		}
		if(left && !left.visited) {
			neighbors.push(left);
		}
		if(right && !right.visited) {
			neighbors.push(right);
		}

		if(neighbors.length> 0) {
			return neighbors[Math.floor(random(0, neighbors.length))];
		}
		else {
			return null;
		}

	}

	this.remove_wall= function(n) {
		var t1= this.i-n.i;

		if(t1=== 1) {
			this.walls[3]= false;
			n.walls[1]= false;
		}
		else if(t1=== -1) {
			this.walls[1]= false;
			n.walls[3]= false;
		}
		var t2= this.j-n.j;
		if(t2=== 1) {
			this.walls[0]= false;
			n.walls[2]= false;
		}
		else if(t2=== -1) {
			this.walls[2]= false;
			n.walls[0]= false;
		}
	}

	this.show= function() {

		stroke(255);

		push(); //go to center of current room
		translate((this.i*room_size + room_size/2), (this.j*room_size + room_size/2));

		texture(brick_img);

		if(this.walls[3]) {
			push(); //for left wall
			translate(-room_size/2, 0);
			rotateY(HALF_PI);
			box(room_size, room_size, 5);
			pop();
		}

		if(this.walls[1]) {
			push(); //for right wall
			translate(room_size/2, 0);
			rotateY(-HALF_PI);
			box(room_size,room_size,5);
			pop();
		}

		if(this.walls[0]) {
			push(); //for front wall
			translate(0, -room_size/2);
			rotateX(-HALF_PI);
			box(room_size, room_size, 5);
			pop();
		}

		if(this.walls[2]) {
			push(); //for wall behind
			translate(0, room_size/2);
			rotateX(HALF_PI);
			box(room_size, room_size, 5);
			pop();
		}

		if(this.i== 0 && this.j== 0) {
			push(); //for the sphere at 0,0
			fill(255, 67, 30);
			translate(0, 0, room_size);
			sphere(room_size/2);
			pop();

		}

		pop();

	}

}

function index(i, j) {
	if(i<0 || j<0 || i>maze_size-1 || j>maze_size-1)
		return -1;
	return j+(i*maze_size);
}

function remove_wall(c, n) {
	var t1= c.i-n.i;
	//console.log(c);
	if(t1=== 1) {
		c.walls[3]= false;
		n.walls[1]= false;
	}
	else if(t1=== -1) {
		c.walls[1]= false;
		n.walls[3]= false;
	}
	var t2= c.j-n.j;
	if(t2=== 1) {
		c.walls[0]= false;
		n.walls[2]= false;
	}
	else if(t2=== -1) {
		c.walls[2]= false;
		n.walls[0]= false;
	}
}

function Walker(x, y) {
	this.x= x;
	this.y= y;
	this.view_point=0;


	this.jump= false;
	this.jump_height= 0;
	this.jumping_cos_angle= 0;
	this.jumping_up= false;

	this.set_view= function() {
		lx= this.x*room_size + room_size/2;
		ly= this.y*room_size + room_size/2;

		//console.log(view_point);

		if(moving!=0) {

			if(this.view_point== 0) {
				camera(lx, ly- moving, 25, lx, ly-1- moving, 25, 0, 0, -1);
				pointLight(255, 255, 255, lx, ly- moving, 25);
			}
			else if(this.view_point== 1) {
				camera(lx+ moving, ly, 25, lx+1+ moving, ly, 25, 0, 0, -1);
				pointLight(255, 255, 255, lx+ moving, ly, 25);
			}
			else if(this.view_point== 2) {
				camera(lx, ly+ moving, 25, lx, ly+1+ moving, 25, 0, 0, -1);
				pointLight(255, 255, 255, lx, ly+ moving, 25);
			}
			else {
				camera(lx- moving, ly, 25, lx-1- moving, ly, 25, 0, 0, -1);
				pointLight(255, 255, 255, lx- moving, ly, 25);
			}
		}
		else if(ang_moving!=0) {
			pointLight(255, 255, 255, lx, ly, 25);
			var vy= 100*Math.cos(ang_moving*Math.PI/180);
			var vx= 100*Math.sin(ang_moving*Math.PI/180);
			if(this.view_point== 0) {
				camera(lx, ly, 25, lx+vx, ly-vy, 25, 0, 0, -1);
			}
			else if(this.view_point== 1) {
				camera(lx, ly, 25, lx+vy, ly+vx, 25, 0, 0, -1);
			}
			else if(this.view_point== 2) {
				camera(lx, ly, 25, lx-vx, ly+vy, 25, 0, 0, -1);
			}
			else {
				camera(lx, ly, 25, lx-vy, ly-vx, 25, 0, 0, -1);
			}
		}
		else {
			pointLight(255, 255, 255, lx, ly, 25);
			if(this.view_point== 0) {
				camera(lx, ly, 25+ this.jump_height, lx, ly-1, 25+ this.jump_height, 0, 0, -1);
			}
			else if(this.view_point== 1) {
				camera(lx, ly, 25+ this.jump_height, lx+1, ly, 25+ this.jump_height, 0, 0, -1);
			}
			else if(this.view_point== 2) {
				camera(lx, ly, 25+ this.jump_height, lx, ly+1, 25+ this.jump_height, 0, 0, -1);
			}
			else {
				camera(lx, ly, 25+ this.jump_height, lx-1, ly, 25+ this.jump_height, 0, 0, -1);
			}
		}
	}

	this.go_forward= function() {
		if(this.view_point==0 && !cell_grid[index(this.x, this.y)].walls[0]) {
			this.y--;
			return true;
		}
		else if(this.view_point==1 && !cell_grid[index(this.x, this.y)].walls[1]) {
			this.x++;
			return true;
		}
		else if(this.view_point==2 && !cell_grid[index(this.x, this.y)].walls[2]) {
			this.y++;
			return true;
		}
		else if(this.view_point==3 && !cell_grid[index(this.x, this.y)].walls[3]) {
			this.x--;
			return true;
		}
		return false;
	}

	this.go_backward= function() {
		if(this.view_point==0 && !cell_grid[index(this.x, this.y)].walls[2]) {
			this.y++;
			return true;
		}
		else if(this.view_point==1 && !cell_grid[index(this.x, this.y)].walls[3]) {
			this.x--;
			return true;
		}
		else if(this.view_point==2 && !cell_grid[index(this.x, this.y)].walls[0]) {
			this.y--;
			return true;
		}
		else if(this.view_point==3 && !cell_grid[index(this.x, this.y)].walls[1]) {
			this.x++;
			return true;
		}
		return false;
	}

	this.check_win= function() {
		if(this.x== 0 && this.y== 0) {
			alert("You Win");
			noLoop();
		}
	}
}




