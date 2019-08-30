
const roads = [
  "Дом Алисы-Дом Боба",
  "Дом Алисы-Почта",
  "Дом Дарии-Дом Эрни",
  "Дом Эрни-Дом Греты",
  "Дом Греты-Магазин",
  "Рынок-Почта",
  "Рынок Ратуша",
  "Дом Алисы-Склад",
  "Дом Боба-Ратуша",
  "Дом Дарии-Ратуша",
  "Дом Греты-Ферма",
  "Рынок-Ферма",
  "Рынок-Магазин",
  "Магазин-Ратуша"
];

// Сеть дорог образует граф. ГРАФ - это множество точек, моединенных линиями.
// Данный граф будет миром, в котором движется наш робот.

// Пишем структуру данных, позволяющая узнать, куда можно попасть из каждого места.
function buildGraph (edges) { // объект словаря, в котором каждому узлу соответствует массив связанных с ним узлов.
  let graph = Object.create(null);
  function addEdge (from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }

  for (let [from, to] of edges.map (r => r.split("-"))) {
    addEdge (from, to);
    addEdge (to, from);
  }
  return graph;
}
const roadGraph = buildGraph(roads);

// Далее сделаем так, чтобы при перемещениях робота нужно было бы не изменять состояние,
// а вычислять новое состояние, отражающее ситуацию после перемещения робота.

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move (destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {
          place: destination, address: p.address
        };
      }).filter(p => p.place != p.address);
      return new VillageState (destination, parcels);
    }
  }
}

// сначала метод movr проверяет, есть ли дорога из текущего места в пункт назначения,
// и, если НЕТ, то возвращает старое состояние, поскольку это недопустимый ход.
// Затем метод создает новое состояние с пунктом назначения в качестве нового местоположения робота.
// Но посылки должнв быть удалены из множества как недоставленные посылки.
// Перемещения - MAP(), а доставка - filter{}

let first = new VillageState (
  "Почта",
  [{place: "Почта", address: "Дом Алисы"}]
);
let next = first.move("Дом Алисы");
console.log(next.place); // Дом Алисы
console.log(next.parcels); // [ ]
console.log(first.place); // Почта

// Результатом перемещения является доставка посылки,
// но исходное состояние по-преднему описывает ситуацию, когда робот находится на почтк,
// а посылка не доставлена.

let object = Object.freeze ({value: 5}); // заморозка, попытка записи в его свойство игнорируется!
object.value = 10;
console.log(object.value); // 5

// моделирование
function runRobot (state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Выполнено за ${turn} ходов`);
      break;
    }
    let action = robot (state, memory);
    state = state.move (action.direction);
    memory = action.memory;
    console.log(`Переход в направлении ${action.direction}`);
  }
}

function randomPick (array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot (state) {
  return {direction: randomPick (roadGraph[state.place])};
}

VillageState.random = function (parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick (Object.keys(roadGraph));
    let place;
    do {
      place = randomPick (Object.keys (roadGraph));
    } while (place == address);
    parcels.push ({place, address});
  }
  return new VillageState ("Почта", parcels);
};

const mailRoute = [
  "Дом Алисы", "Сарай", "Дом Алисы", "Дом Боба", "Ратуша", "Дом Дарии", "Дом Эрни",
  "Дом Греты", "Магазин", "Дом Греты", "Ферма", "Рынок", "Почта"
];

function routeRobot (state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

// наращиваем маршруты
function findRoute (graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat (place);
      if (!work.some (w => w.at == place)) {
        work.push ({at: place, route: route.concat (place)});
      }
    }
  }
}

function goalOrientedRobot ({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute (roadGraph, place, parcel.place);
    }  else {
      route = findRoute (roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

runRobot (VillageState.random(), randomRobot);

























































































//////////////////////
