function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

const BASE_WIDTH = 400;
const BASE_HEIGHT = 330;
const GRID_STEP = 10;
const SCORE_HEIGHT = 30;

let currentScaleFactor = 1;

const start = {
  active: true,
  speed: 120,
  direction: "right",
  snake: [[50, 70], [60, 70], [70, 70], [80, 70]], 
  food: [200, 70],
  score: 0,
  high_score: parseInt(localStorage.getItem("high_score"), 10) || 0 };

const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;
const PADDING = 20;

function handleResize() {
  const root = document.getElementById("root");
  if (!root) return;

  const availableWidth = window.innerWidth - (2 * PADDING);
  const availableHeight = window.innerHeight - (2 * PADDING);

  let newWidth, newHeight;

  const availableRatio = availableWidth / availableHeight;

  if (availableRatio > ASPECT_RATIO) {
    newHeight = availableHeight;
    newWidth = newHeight * ASPECT_RATIO;
  } else {
    newWidth = availableWidth;
    newHeight = newWidth / ASPECT_RATIO;
  }

  root.style.width = `${newWidth}px`;
  root.style.height = `${newHeight}px`;

  currentScaleFactor = newWidth / BASE_WIDTH;
  
  if (window.appInstance && currentScaleFactor !== 1) {
      window.appInstance.forceUpdate();
  }
}

window.addEventListener('resize', handleResize);

class App extends React.Component {
  constructor(props) {
    super(props);_defineProperty(this, "startStop",

    manual => {
      let active = this.state.active;
      
      if (manual) {
        this.setState({ active: !active });
      }
    
      if (!active) {
        this.interval = setInterval(() => this.updateSnake(), this.state.speed);
      }
      else {
        clearInterval(this.interval);
      
        const currentScore = this.state.score;
        let currentHighScore = parseInt(localStorage.getItem("high_score"), 10) || 0; 

        if (currentScore > currentHighScore) {
            currentHighScore = currentScore;
            localStorage.setItem("high_score", currentHighScore);
        }

        this.setState({
          active: false,
          speed: 120,
          direction: "right",
          snake: [[50, 70], [60, 70], [70, 70], [80, 70]], 
          food: [200, 70],
          score: 0,
          high_score: currentHighScore
        });
      }
    });_defineProperty(this, "handleKeys",

    event => {
      let currentD = this.state.direction;
      console.log(currentD);
      let active = this.state.active;
      if (event.keyCode === 13) {
        this.startStop(true);
      }
      if (event.keyCode === 65 && currentD != "right") {
        this.setState({ direction: "left" });
        this.swapClass();
      }
      if (event.keyCode === 68 && currentD != "left") {
        this.setState({ direction: "right" });
        this.swapClass();
      }
      if (event.keyCode === 87 && currentD != "down") {
        this.setState({ direction: "up" });
        this.swapClass();
      }
      if (event.keyCode === 83 && currentD != "up") {
        this.setState({ direction: "down" });
        this.swapClass();
      }
    });_defineProperty(this, "speedUp",

    () => {
      let speed = this.state.speed;
      if (speed > 50) {
        speed = speed - 2;
      }
      clearInterval(this.interval);
      this.interval = setInterval(() => this.updateSnake(), speed);
      this.setState({ speed: speed });
    });_defineProperty(this, "swapClass",


    () => {
      var root = document.getElementById("root");
      root.className = "";
      root.className = this.state.direction;
    });this.state = start;}updateSnake() {
      var direction = this.state.direction;
      var currentSnake = this.state.snake;
      var snakeHead = currentSnake[currentSnake.length - 1];
      var newHead = [];
      var target = this.state.food;

      switch (direction) {
          case "up":
              newHead = [snakeHead[0], snakeHead[1] - GRID_STEP];
              break;
          case "right":
              newHead = [snakeHead[0] + GRID_STEP, snakeHead[1]];
              break;
          case "down":
              newHead = [snakeHead[0], snakeHead[1] + GRID_STEP];
              break;
          case "left":
              newHead = [snakeHead[0] - GRID_STEP, snakeHead[1]];
              break;
          default:
              newHead = [snakeHead[0], snakeHead[1]];
      }
      
      currentSnake.push(newHead);

      currentSnake.forEach((val, i, array) => {
          if (i != array.length - 1) {
              if (val.toString() == newHead.toString()) {
                  this.startStop(true);
              }
          }
      });

      const MAX_X = BASE_WIDTH - GRID_STEP;
      const MIN_X = 0;
      const MAX_Y = BASE_HEIGHT - GRID_STEP;
      const MIN_Y = SCORE_HEIGHT;

      if (newHead[0] > MAX_X || newHead[0] < MIN_X || newHead[1] > MAX_Y || newHead[1] < MIN_Y) {
          
          let teleHead = currentSnake[currentSnake.length - 1];
          
          const WRAP_X = BASE_WIDTH;
          const WRAP_Y = BASE_HEIGHT - SCORE_HEIGHT;

          if (newHead[0] > MAX_X) {
              teleHead[0] = teleHead[0] - WRAP_X;
              currentSnake.shift();
          }
          if (newHead[0] < MIN_X) {
              teleHead[0] = teleHead[0] + WRAP_X;
              currentSnake.shift();
          }
          if (newHead[1] > MAX_Y) {
              teleHead[1] = teleHead[1] - WRAP_Y;
              currentSnake.shift();
          }
          if (newHead[1] < MIN_Y) {
              teleHead[1] = teleHead[1] + WRAP_Y;
              currentSnake.shift();
          }
      } else {
          if (newHead[0] == target[0] && newHead[1] == target[1]) {
              
              const FOOD_SPAWN_MAX_X = BASE_WIDTH - (2 * GRID_STEP);
              const FOOD_SPAWN_MIN_X = GRID_STEP;
              const FOOD_SPAWN_MAX_Y = BASE_HEIGHT - (2 * GRID_STEP);
              const FOOD_SPAWN_MIN_Y = SCORE_HEIGHT + GRID_STEP;
              
              let posX = Math.floor(Math.random() * (FOOD_SPAWN_MAX_X - FOOD_SPAWN_MIN_X + GRID_STEP)) + FOOD_SPAWN_MIN_X;
              let posY = Math.floor(Math.random() * (FOOD_SPAWN_MAX_Y - FOOD_SPAWN_MIN_Y + GRID_STEP)) + FOOD_SPAWN_MIN_Y;

              posX = Math.ceil(posX / GRID_STEP) * GRID_STEP;
              posY = Math.ceil(posY / GRID_STEP) * GRID_STEP;

              this.setState(prevState => ({ snake: currentSnake, food: [posX, posY], score: prevState.score + 1 }));
          } else {
              currentSnake.shift();
              if (this.state.active) {
                  this.setState({ snake: currentSnake });
              }
          }
      }

    }componentDidMount() {
      handleResize();
      this.swapClass();document.addEventListener("keydown", this.handleKeys, false);if (this.state.active) {this.startStop(false);}}componentDidUpdate(prevProps, prevState) {
    let score = this.state.score;if (score % 3 == 0 && score > 0 && score != prevState.score) {this.speedUp();}document.addEventListener("keydown", this.handleKeys, false);}componentWillUnmount() {clearInterval(this.interval);
      window.removeEventListener('resize', handleResize);
    }render() {var theSnake = this.state.snake;var food = this.state.food;return React.createElement(React.Fragment, null, React.createElement(Menu, { active: this.state.active }),
    React.createElement(Score, { score: this.state.score, high_score: this.state.high_score }),
    theSnake.map((val, i) =>
    React.createElement(Part, {
      transition: this.state.speed,
      direction: this.state.direction,
      top: val[1],
      left: val[0] })),


    React.createElement(Food, { top: food[1], left: food[0] }));


  }}


class Score extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let snake = this.props.snake;
    return(
      React.createElement("div", { className: "score" },
      React.createElement("span", null, "Score: ",
      React.createElement("strong", null, this.props.score)),

      React.createElement("span", null, "High Score: ",
      React.createElement("strong", null, this.props.high_score))));

  }}

class Part extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    var classes = "part " + this.props.direction;
    const scaledSize = 4 * currentScaleFactor; 
    return(
      React.createElement("article", {
        style: {
          transition: this.props.transition + 50 + "ms",
          top: (this.props.top * currentScaleFactor) + "px",
          left: (this.props.left * currentScaleFactor) + "px",
          width: scaledSize + "px",
          height: scaledSize + "px",
          borderRadius: (scaledSize / 2) + "px" 
        },
        className: classes }));
  }}

class Food extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const scaledSize = 4 * currentScaleFactor;
    return(
      React.createElement("div", {
        style: { 
          top: (this.props.top * currentScaleFactor) + "px", 
          left: (this.props.left * currentScaleFactor) + "px",
          width: scaledSize + "px",
          height: scaledSize + "px",
          borderWidth: (1 * currentScaleFactor) + "px",
          borderRadius: (scaledSize / 2 + 1 * currentScaleFactor) + "px"
        },
        className: "food" }));
  }}

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    var menu_list = this.props.active ? "menu hidden" : "menu";
    return(
      React.createElement("div", { className: menu_list }, "Press ",
      React.createElement("span", null, "enter"), " to start", React.createElement("br", null),
      React.createElement("span", null, "w a s d"), " keys to control"));
  }}

window.appInstance = ReactDOM.render( React.createElement(App, null), document.getElementById("root"));