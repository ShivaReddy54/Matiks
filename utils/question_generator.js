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

exports.generateQuestions = (count = 30) => {
    const questions = [];

    for (let i = 0; i < count; i++) {
        const op = OPS[randomInt(0, OPS.length - 1)];
        let num1, num2;

        if (op === '-') {
            num1 = randomInt(10, 99);
            num2 = randomInt(0, num1);
        } else {
            num1 = randomInt(0, 99);
            num2 = randomInt(0, 99);
        }

        questions.push({
            num1,
            num2,
            op,
            correctAnswer: evalQuestion(num1, num2, op)
        });
    }

    return questions;
};
