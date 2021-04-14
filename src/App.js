/* eslint-disable react-hooks/exhaustive-deps, jsx-a11y/alt-text */

import { useState, useReducer, useMemo, useEffect, useRef } from 'react';
import { noop, range, flow, map, fromPairs, get, set, slice, toPairs, reduce } from 'lodash/fp';
import { useKeyPressEvent } from 'react-use';
import cns from 'classname';
import './App.css';

const colsLength = 10;
const rowsLength = 10;
const APPLE_SRC = 'https://pngimg.com/uploads/apple/apple_PNG12405.png';

const directionArrows = ['→', '↓', '←', '↑'];

const RIGHT_INDEX = 0;
const DOWN_INDEX = 1;
const LEFT_INDEX = 2;
const UP_INDEX = 3;

const MOVE_BACK = 'MOVE_BACK';
const MOVE_FORWARD = 'MOVE_FORWARD';
const ROTATE_PLUS_90 = 'ROTATE_PLUS_90';
const ROTATE_MINUS_90 = 'ROTATE_MINUS_90';
const SHIFT_ACTIONS_STACK = 'SHIFT_ACTIONS_STACK';

const arrowsByName = {
  [MOVE_BACK]: directionArrows[LEFT_INDEX],
  [MOVE_FORWARD]: directionArrows[RIGHT_INDEX],
  [ROTATE_PLUS_90]: '⟳',
  [ROTATE_MINUS_90]: '⟲',
};

const SIM_MOVE_BACK_ACTION = 'SIM_MOVE_BACK';
const SIM_MOVE_FORWARD_ACTION = 'SIM_MOVE_FORWARD';
const SIM_ROTATE_PLUS_90 = 'SIM_ROTATE_PLUS_90';
const SIM_ROTATE_MINUS_90 = 'SIM_ROTATE_MINUS_90';

// const moveBack = () => ({ type: MOVE_BACK });
// const moveForward = () => ({ type: MOVE_FORWARD });
// const rotatePlus90 = () => ({ type: ROTATE_PLUS_90 });
// const rotateMinus90 = () => ({ type: ROTATE_MINUS_90 });
const shiftActionStack = () => ({ type: SHIFT_ACTIONS_STACK });

const simMoveBack = () => ({ type: SIM_MOVE_BACK_ACTION });
const simMoveForward = () => ({ type: SIM_MOVE_FORWARD_ACTION });
const simRotatePlus90 = () => ({ type: SIM_ROTATE_PLUS_90 });
const simRotateMinus90 = () => ({ type: SIM_ROTATE_MINUS_90 });

const MAX_STEP_HISTORY_LENGTH = 5;

const createReducer = ({ colsLength, rowsLength }) => (state, action) => {
  const { type } = action;

  let { stepsHistory, currentColIndex, currentRowIndex, currentDirectionIndex, points, actionsStack } = state;

  const rotatePlus90Reducer = () => {
    const nextDirectionIndex = (currentDirectionIndex + 1) % directionArrows.length;

    if (nextDirectionIndex  !== currentDirectionIndex) {
      state = addStepToHistory();
    }

    return { ...state, currentDirectionIndex: nextDirectionIndex };
  };

  const rotateMinus90Reducer = () => {
    let nextDirectionIndex = (currentDirectionIndex - 1);

    if (nextDirectionIndex < 0) {
      nextDirectionIndex = directionArrows.length - 1;
    }

    if (nextDirectionIndex  !== currentDirectionIndex) {
      state = addStepToHistory();
    }

    return { ...state, currentDirectionIndex: nextDirectionIndex };
  };

  const addStepToHistory = () => {
    stepsHistory = [...stepsHistory, type];

    return { ...state, stepsHistory: slice(Math.max(0, stepsHistory.length - MAX_STEP_HISTORY_LENGTH), stepsHistory.length, stepsHistory) };
  }

  switch(type) {
    case MOVE_FORWARD: {
      let colOffset = 0;
      let rowOffset = 0;

      if (currentDirectionIndex === LEFT_INDEX) {
        colOffset = -1;
      } else if (currentDirectionIndex === RIGHT_INDEX) {
        colOffset = 1;
      } else if (currentDirectionIndex === UP_INDEX) {
        rowOffset = -1
      } else if (currentDirectionIndex === DOWN_INDEX) {
        rowOffset = 1;
      }

      let nextRowIndex = currentRowIndex + rowOffset;
      let nextColIndex = currentColIndex + colOffset;

      if (nextRowIndex > rowsLength - 1 || nextRowIndex < 0) {
        rowOffset = 0;
      }

      if (nextColIndex > colsLength - 1 || nextColIndex < 0) {
        colOffset = 0;
      }

      if (rowOffset === 0 && colOffset === 0) {
        state = rotatePlus90Reducer();
      }

      nextRowIndex = currentRowIndex + rowOffset;
      nextColIndex = currentColIndex + colOffset;

      if (get([nextRowIndex, nextColIndex], points)) {
        points = set([nextRowIndex, nextColIndex], false, points);
      }

      if (nextRowIndex !== currentRowIndex || nextColIndex !== currentColIndex) {
        state = addStepToHistory();
      }

      return {
        ...state,
        points,
        currentRowIndex: nextRowIndex,
        currentColIndex: nextColIndex,
      };
    }

    case MOVE_BACK: {
      let colOffset = 0;
      let rowOffset = 0;

      if (currentDirectionIndex === LEFT_INDEX) {
        colOffset = 1;
      } else if (currentDirectionIndex === RIGHT_INDEX) {
        colOffset = -1;
      } else if (currentDirectionIndex === UP_INDEX) {
        rowOffset = 1
      } else if (currentDirectionIndex === DOWN_INDEX) {
        rowOffset = -1;
      }

      let nextRowIndex = currentRowIndex + rowOffset;
      let nextColIndex = currentColIndex + colOffset;

      if (nextRowIndex > rowsLength - 1 || nextRowIndex < 0) {
        rowOffset = 0;
      }

      if (nextColIndex > colsLength - 1 || nextColIndex < 0) {
        colOffset = 0;
      }

      if (rowOffset === 0 && colOffset === 0) {
        state = rotatePlus90Reducer();
      }

      nextRowIndex = currentRowIndex + rowOffset;
      nextColIndex = currentColIndex + colOffset;

      if (get([nextRowIndex, nextColIndex], points)) {
        points = set([nextRowIndex, nextColIndex], false, points);
      }

      if (nextRowIndex !== currentRowIndex || nextColIndex !== currentColIndex) {
        state = addStepToHistory();
      }

      return {
        ...state,
        points,
        currentRowIndex: nextRowIndex,
        currentColIndex: nextColIndex,
      };
    }

    case ROTATE_PLUS_90: {
      return rotatePlus90Reducer();
    }

    case ROTATE_MINUS_90: {
      return rotateMinus90Reducer();
    }

    case SIM_MOVE_BACK_ACTION: {
      return { ...state, actionsStack: [...actionsStack, MOVE_BACK] };
    }

    case SIM_MOVE_FORWARD_ACTION: {
      return { ...state, actionsStack: [...actionsStack, MOVE_FORWARD] };
    }

    case SIM_ROTATE_PLUS_90: {
      return { ...state, actionsStack: [...actionsStack, ROTATE_PLUS_90] };
    }

    case SIM_ROTATE_MINUS_90: {
      return { ...state, actionsStack: [...actionsStack, ROTATE_MINUS_90] };
    }

    case SHIFT_ACTIONS_STACK: {
      return { ...state, actionsStack: slice(1, actionsStack.length, actionsStack) };
    }

    default: {
      return state;
    }
  }
};

const modalColors = [
  'modal_info',
  'modal_green',
  'modal_orange',
  'modal_red',
  'modal_blue',
];

const createGrid = ({ colsLength, rowsLength }) => flow(range(0), map(() => range(0, colsLength)))(rowsLength)

const getRandom = length => Math.round(Math.random() * 10000) % length;

const getRandomActionType = (actionsSeq) => actionsSeq[getRandom(actionsSeq.length)];

const getRandomModalColor = () => modalColors[getRandom(modalColors.length)];

const generateRandomPoint = ({ colsLength, rowsLength }) => ({
  x: getRandom(colsLength),
  y: getRandom(rowsLength),
});

const clickEffect = ({ el, event } = {}) => {
  let top = 0;
  let left = 0;

  if (event) {
    top = event.clientY;
    left = event.clientX;
  } else if (el) {
    const { x, y, width, height } = el.getBoundingClientRect();

    top = y + getRandom(height);
    left = x + getRandom(width);
  }

  if (top === 0 && left === 0) {
    return;
  }

  const div = document.createElement('div');

  div.className = 'clickEffect';
  div.style.top = top + 'px';
  div.style.left = left + 'px';

  document.body.appendChild(div);

  div.addEventListener('animationend', () => {
    div.parentElement.removeChild(div);
  });
}

const useClickGenerator = ({ stop, dispatch, refs, delay = 300, actionsStackRef, actionsSeq }) => {
  const timeoutRef = useRef();

  useEffect(() => {
    if (stop) {
      clearTimeout(timeoutRef.current);
    }
  }, [stop]);

  useEffect(() => {
    const nextTick = () => {
      timeoutRef.current = setTimeout(() => {
        let actionType;

        if (actionsStackRef.current.length) {
          ([actionType] = actionsStackRef.current);

          dispatch(shiftActionStack());
        } else {
          actionType = getRandomActionType(actionsSeq);
        }

        const action = () => ({ type: actionType });
        const el = refs[actionType].current;

        el.classList.add('hover');

        dispatch(action());

        timeoutRef.current = setTimeout(() => {
          el.classList.remove('hover');

          clickEffect({ el, clientX: 100, clientY: 100 });

          nextTick();
        }, 400);
      }, delay);
    };

    nextTick();

    return () => clearTimeout(timeoutRef.current);
  }, []);
};

const Timer = ({ initial = 0, callback = noop }) => {
  const counterRef = useRef();
  const [counter, setCounter] = useState(initial);

  counterRef.current = counter;

  useEffect(() => {
    let timeoutId;

    const run = () => {
      timeoutId = setTimeout(() => {
        if (counterRef.current === 0) {
          callback();
        } else {
          setCounter(counterRef.current - 1);

          run();
        }
      }, 1000);
    };

    run();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="timer">
      {counter}
    </div>
  );
};

const MAX_APPLES_LENGTH = 10;

function App() {
  const moveBackRef = useRef();
  const moveForwardRef = useRef();
  const rotatePlusRef = useRef();
  const rotateMinusRef = useRef();
  const actionsStackRef = useRef();
  const [stop, setStop] = useState(false);

  const initialPoints = useMemo(() =>
    flow(
      range(0),
      map(() => generateRandomPoint({ colsLength, rowsLength })),
      map(({ x, y }) => [x, { [y]: true }]),
      fromPairs,
    )(MAX_APPLES_LENGTH), []);

  const initialState = useMemo(() => ({
    stepsHistory: [],
    currentColIndex: 0,
    currentRowIndex: 0,
    currentDirectionIndex: 0,
    actionsStack: [],
    points: initialPoints,
  }), []);

  const grid = useMemo(() => createGrid({ colsLength, rowsLength }), [colsLength, rowsLength]);
  const reducer = useMemo(() => createReducer({ colsLength, rowsLength }), [colsLength, rowsLength]);

  const [{
    actionsStack,
    currentColIndex,
    currentDirectionIndex,
    currentRowIndex,
    points,
    stepsHistory,
  }, dispatch] = useReducer(reducer, initialState);

  actionsStackRef.current = actionsStack;

  useClickGenerator({
    stop,
    actionsStackRef,
    dispatch,
    refs: {
      MOVE_FORWARD: moveForwardRef,
      MOVE_BACK: moveBackRef,
      ROTATE_PLUS_90: rotatePlusRef,
      ROTATE_MINUS_90: rotateMinusRef,
    },
    actionsSeq: [
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      MOVE_FORWARD,
      ROTATE_PLUS_90,
    ],
    delay: 500
  });

  const totalPoints = flow(toPairs, reduce((acc, [, val]) => flow(toPairs, reduce((acc, [, val]) => val === false ? acc + 1 : acc, acc))(val), 0))(points);

  const handleMoveBackClick = event => {
    clickEffect({ event });
    dispatch(simMoveBack());
  };

  const handleMoveForwardClick = event => {
    clickEffect({ event });
    dispatch(simMoveForward());
  };

  const handleRotatePlus90Click = event => {
    clickEffect({ event });
    dispatch(simRotatePlus90());
  };

  const handleRotateMinus90Click = event => {
    clickEffect({ event });
    dispatch(simRotateMinus90());
  };

  useKeyPressEvent('ArrowUp', () => {
    clickEffect({ el: moveForwardRef.current });
    dispatch(simMoveForward());
  });

  useKeyPressEvent('ArrowRight', () => {
    clickEffect({ el: rotatePlusRef.current });
    dispatch(simRotatePlus90());
  });

  useKeyPressEvent('ArrowLeft', () => {
    clickEffect({ el: rotateMinusRef.current });
    dispatch(simRotateMinus90());
  });

  const modalColor = useMemo(() => getRandomModalColor(), []);

  return (
    <div className="app">
      <div className="grid-wrapper">
        <div className="grid">
          {grid.map((cols, rowIndex) => (
            <div className="row" key={rowIndex}>
              {cols.map((colIndex) => {
                const isActive = currentColIndex === colIndex && currentRowIndex === rowIndex;
                const apple = get([rowIndex, colIndex], points) && <img src={APPLE_SRC} className="apple-image" />;

                const colNumber = Math.abs(colIndex - currentColIndex);
                const rowNumber = Math.abs(rowIndex - currentRowIndex);

                let cellNumber = null

                if (currentColIndex === colIndex) {
                  cellNumber = rowNumber;
                }

                if (currentRowIndex === rowIndex) {
                  cellNumber = colNumber;
                }

                if (cellNumber > 2) {
                  cellNumber = null;
                }

                return (
                  <div key={colIndex} className={cns('cell', { active: isActive })}>
                    <div className="cell-inner">
                      <div className="cell-number">{cellNumber}</div>
                      {isActive ? directionArrows[currentDirectionIndex] : apple}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {stop ? (
        <div className={cns('modal', modalColor)}>
          <div className="total-points">
            {`You've got ${totalPoints} apple(s)!`}
          </div>
        </div>
      ) : (
        <div className="corner-points">
          {totalPoints}
        </div>
      )}

      <div className="buttons">
        <div className="button- block display-none">
          <button type="button" onClick={handleMoveBackClick} className="button" ref={moveBackRef}>
            <div className="point" />
            Move back
          </button>
        </div>
        <div className="button-block">
          <button type="button" onClick={handleMoveForwardClick} className="button" ref={moveForwardRef}>
            <div className="point" />
            Move forward
          </button>
        </div>
        <div className="button-block">
          <button type="button" onClick={handleRotatePlus90Click} className="button" ref={rotatePlusRef}>
            <div className="point" />
            Rotate (+90)
          </button>
        </div>
        <div className="button-block">
          <button type="button" onClick={handleRotateMinus90Click} className="button" ref={rotateMinusRef}>
            <div className="point" />
            Rotate (-90)
          </button>
        </div>
      </div>

      {stop ? null : (
        <div className="timer-wrapper">
          <Timer initial={30} callback={() => setStop(true)} />
        </div>
      )}
      <div className="steps-history">
        {stepsHistory.map((actionType, index) => (
          <div key={index} className={cns('step-history__item', { active: index === stepsHistory.length - 1})}>
            {arrowsByName[actionType]}
          </div>
        ))}
        {actionsStack.map((actionType, index) => (
          <div key={index} className="step-history__item">
            {arrowsByName[actionType]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
