const OPS = ['+', '-', '*'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const evalQuestion = (num1, num2, op) => {
    switch (op) {
        case '+': return num1 + num2;
        case '-': return num1 - num2;
        case '*': return num1 * num2;
        default: return 0;
    }
};

/* 1 digit = 0–9, 2 digits = 10–99 */
const ONE_DIGIT = () => randomInt(0, 9);
const TWO_DIGITS = () => randomInt(10, 99);

const pickOperands = (op, digitType) => {
    if (digitType === '1+1') {
        const a = randomInt(0, 9);
        const b = randomInt(0, 9);
        if (op === '-') {
            return a >= b ? [a, b] : [b, a];
        }
        return [a, b];
    }
    if (digitType === '1+2') {
        const one = ONE_DIGIT();
        const two = TWO_DIGITS();
        if (op === '-') {
            return one >= two ? [one, two] : [two, one];
        }
        return [one, two];
    }
    /* 2+2 */
    const a = TWO_DIGITS();
    const b = TWO_DIGITS();
    if (op === '-') {
        return a >= b ? [a, b] : [b, a];
    }
    return [a, b];
};

/**
 * Generate questions with digit distribution:
 * 60% both 1-digit, 30% one 1-digit + one 2-digit, 10% both 2-digit
 */
exports.generateQuestions = (count = 30) => {
    const n1_1 = Math.round(count * 0.6);
    const n1_2 = Math.round(count * 0.3);
    const n2_2 = count - n1_1 - n1_2;

    const types = [
        ...Array(n1_1).fill('1+1'),
        ...Array(n1_2).fill('1+2'),
        ...Array(n2_2).fill('2+2')
    ];

    for (let i = types.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [types[i], types[j]] = [types[j], types[i]];
    }

    const questions = [];
    for (let i = 0; i < count; i++) {
        const op = OPS[randomInt(0, OPS.length - 1)];
        const [num1, num2] = pickOperands(op, types[i]);
        questions.push({
            num1,
            num2,
            op,
            correctAnswer: evalQuestion(num1, num2, op)
        });
    }
    return questions;
};
