var canvas = null;
var score = 0;
var circles = null;
var colors = null;
var width = 220;
var height = width;
var step = 40 / 400 * width;
var stepBy2 = 20 / 400 * width;
var offsetX = 0;
var offsetY = 0;
var radius = 18 / 400 * width;
var radiusSquare = radius * radius;
var neighbours = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
];
let frame = { x: 0, y: 0 };
var availableTime = 300;
var animationFrames = 0;
var animating = false;
var animationInterval = null;
var interval = null;

function animate() {
    animationFrames += 10;
    if (animationFrames >= 256) {
        animationFrames = 0;
        clearInterval(animationInterval);
        animationInterval = null;
        var count = 0;
        for (var i = 0; i < circles.length; ++i) {
            for (var j = 0; j < circles[i].length; ++j) {
                if (circles[i][j].selected) {
                    circles[i][j].destroyed = true;
                    circles[i][j].selected = false;
                    ++count;
                }
            }
        }
        score += Math.pow(2.0, count);
        document.getElementById("score").innerHTML = "<b>Score : " + score + "</b>";
        animating = false;
        update();
        draw();
    }
    else {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < circles.length; ++i) {
            for (var j = 0; j < circles[i].length; ++j) {
                var c = circles[i][j];
                if (c.destroyed) continue;
                if (c.selected) {
                    ctx.fillStyle = "rgb(255, " + animationFrames + ", " + animationFrames + ")";
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, radius, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
                else {
                    ctx.fillStyle = c.color;
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, radius, 0, 2 * Math.PI, false);
                    ctx.fill();
                }
            }
        }
    }
}

function tick() {
    if (animating) return;
    if (availableTime > 0) {
        --availableTime;
        var mm = Math.floor(availableTime / 60);
        var ss = availableTime % 60;
        var at = (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
        document.getElementById("availableTime").innerHTML = "<b>" + at + "</b>";
    }
    else {
        if (interval) clearInterval(interval);
        alert("时间到了游戏结束!");
        if (confirm("是否重新再来一局?")) {
            startNewGame();
        }
    }
}

function init() {
    canvas = document.getElementById("gCanvas");
    canvas.width = width;
    canvas.height = height;
    score = 0;
    colors = ["rgb(200,0,0)", "rgb(0,200,0)", "rgb(0,0,200)", "rgb(200,200,0)", "rgb(200,0,200)"];
    circles = [];
    for (var i = 0; i < width; i += step) {
        a = [];
        for (var j = 0; j < height; j += step) {
            a.push({
                x: i + radius,
                y: j + radius,
                selected: false,
                destroyed: false,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        circles.push(a);
    }
    if (stopTime > 0)
        availableTime = stopTime;
    else
        availableTime = 180;
    interval = setInterval(tick, 1000);
}

function swap(c1, c2) {
    var color = c1.color;
    c1.color = c2.color;
    c2.color = color;
    c1.destroyed = false;
    c1.selected = false;
    c2.destroyed = true;
    c2.selected = false;
}

function update() {
    for (var i = 0; i < circles.length; ++i) {
        var done = false;
        while (!done) {
            done = true;
            for (var j = 1; j < circles[i].length; ++j) {
                var c1 = circles[i][j];
                var c2 = circles[i][j - 1];
                if (c1.destroyed && !c2.destroyed) {
                    done = false;
                    swap(c1, c2);
                }
            }
        }
    }
    var l = circles.length;
    var c = circles[0].length;
    for (var j = 0; j < c; ++j) {
        var done = false;
        while (!done) {
            done = true;
            for (var i = 1; i < l; ++i) {
                var c1 = circles[i][j];
                var c2 = circles[i - 1][j];
                if (c1.destroyed && !c2.destroyed) {
                    done = false;
                    swap(c1, c2);
                }
            }
        }
    }
}

function onMouseClick(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var c = null;
    var ii = -1;
    var jj = -1;
    for (var i = 0; i < circles.length && ii === -1; ++i) {
        for (var j = 0; j < circles[i].length; ++j) {
            c = circles[i][j];
            if (!c.destroyed) {
                var dx = c.x - x;
                var dy = c.y - y;
                var d = dx * dx + dy * dy;
                if (d <= radiusSquare) {
                    ii = i;
                    jj = j;
                    break;
                }
                else {
                    c = null;
                }
            }
        }
    }
    if (ii != -1) c = circles[ii][jj];
    else c = null;
    if (c) {
        if (c.destroyed) {
        }
        else if (c.selected) {
            var count = 0;
            for (var i = 0; i < circles.length; ++i) {
                for (var j = 0; j < circles[i].length; ++j) {
                    if (circles[i][j].selected) {
                        ++count;
                    }
                }
            }
            if (count > 1) {
                animating = true;
                animationInterval = setInterval(animate, 1);
            }
        }
        else {
            for (var i = 0; i < circles.length; ++i) {
                for (var j = 0; j < circles[i].length; ++j) {
                    circles[i][j].selected = false;
                }
            }
            var q = [];
            q.push([ii, jj]);
            c.selected = true;
            while (q.length != 0) {
                var top = q[0];
                q.shift(1);
                var m = top[0];
                var n = top[1];
                for (var i = 0; i < neighbours.length; ++i) {
                    xx = m + neighbours[i][0];
                    yy = n + neighbours[i][1];
                    if (xx >= 0 && xx < circles.length && yy >= 0 && yy < circles[xx].length &&
                        circles[xx][yy].selected === false && circles[xx][yy].color == c.color
                        && circles[xx][yy].destroyed === false) {
                        circles[xx][yy].selected = true;
                        q.push([xx, yy]);
                    }
                }
            }
        }
        update();
        draw();

        var endGame = true;
        for (var i = 0; i < circles.length && endGame; ++i) {
            for (var j = 0; j < circles[i].length; ++j) {
                if (!circles[i][j].destroyed) {
                    for (var k = 0; k < neighbours.length; ++k) {
                        var xx = i + neighbours[k][0];
                        var yy = j + neighbours[k][1];
                        if (xx >= 0 && xx < circles.length && yy >= 0 && yy < circles[xx].length && !circles[xx][yy].destroyed && circles[xx][yy].color == circles[i][j].color) {
                            endGame = false;
                            break;
                        }
                    }
                }
            }
        }
        if (endGame) {
            if (interval) clearInterval(interval);
            alert("时间到了游戏结束!");
            if (confirm("是否重新再来一局?")) {
                startNewGame();
            }
        }
    }
}

function draw() {
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        for (var i = 0; i < circles.length; ++i) {
            for (var j = 0; j < circles[i].length; ++j) {
                var c = circles[i][j];
                if (c.destroyed) continue;
                ctx.fillStyle = c.color;
                ctx.beginPath();
                ctx.arc(c.x, c.y, radius, 0, 2 * Math.PI, false);
                ctx.fill();
                if (c.selected) {
                    ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
                    ctx.fillRect(c.x - stepBy2, c.y - stepBy2, step, step);
                }
            }
        }
        ctx.rect(frame.x - 1, frame.y - 1, step, step);
        ctx.stroke();
        canvas.addEventListener("mousedown", onMouseClick, false);
    }
    else {
        alert("获取Canvas对象失败！");
    }
}

function startNewGame() {
    init();
    draw();
}

window.onload = function () {
    document.addEventListener("keydown", handleKeydown);
    startNewGame();
}

var isStop = false;
var stopTime = 0;

function handleKeydown(e) {
    switch (e.key) {
        case "SoftLeft":
            if (isStop) {
                $('#mask').hide();
                $('#softkey-left').text('暂停');
                init();
                stopTime = 0;
                isStop = false;
            }
            else {
                $('#mask').show();
                $('#softkey-left').text('恢复');
                if (interval)
                    clearInterval(interval);
                stopTime = availableTime;
                isStop = true;
            }
            break;
        case "SoftRight":
            if (!isStop)
                location.reload();
            break;
        case "ArrowUp":
            if (!isStop) {
                frame.y -= step;
                if (frame.y < 0)
                    frame.y = height - step;
            }
            break;
        case "ArrowDown":
            if (!isStop) {
                frame.y += step;
                if (frame.y > height - step)
                    frame.y = 0;
            }
            break;
        case "ArrowLeft":
            if (!isStop) {
                frame.x -= step;
                if (frame.x < 0)
                    frame.x = width - step;
            }
            break;
        case "ArrowRight":
            if (!isStop) {
                frame.x += step;
                if (frame.x > width - step)
                    frame.x = 0;
            }
            break;
        case "Enter":
            if (!isStop) {
                var rect = canvas.getBoundingClientRect();
                onMouseClick({ clientX: rect.left + frame.x + step / 2, clientY: rect.top + frame.y + step / 2 });
            }
            break;
        case 'Backspace':
            if (confirm('是否退出?'))
                window.close();
            break;
    }
    draw();
}