import { createInterface } from 'readline'
import {stdin, stdout} from 'node:process'

const LINK = 'https://api.nbrb.by/ExRates/Rates/431?ParamMode=0'

const rl = createInterface({ input: stdin, output: stdout })

function print(d){
  stdout.write(d + '\n')
}

function color(text, color) {
  const codes = {
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    reset: 0
  }
  return `\x1b[${codes[color]}m${text}\x1b[0m`
}

function writePls() {
  print(color('Write your summ', 'magenta'))
}

function summOut(txt, num){
  print(color(`${txt}: `, 'green') + color(num, 'yellow'))
}


function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

async function convertSumm(summ) {
    summOut('Your summ', summ)
    const response = await fetch(LINK)
    const data = await response.json()

    const rate = data.Cur_OfficialRate
    summOut('Rate', rate)

    summOut('Full', summ * rate)
    
    const round = roundTo(summ * rate)
    summOut('Rounded', round)
}

rl.on('line', async text => {
  const num = parseFloat(text)
  if (isNaN(num)) {
    return print(color('Input is not a number', 'red'))
  }
  await convertSumm(num)
  writePls()
})

writePls()


