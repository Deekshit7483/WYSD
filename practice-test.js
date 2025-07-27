// Practice Test Logic for WYSD 2025
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
	apiKey: "AIzaSyD2WcLwVWvylk6fiEietUSDRp4JG9PnI8o",
	authDomain: "wysd-a7d59.firebaseapp.com",
	projectId: "wysd-a7d59",
	storageBucket: "wysd-a7d59.firebasestorage.app",
	messagingSenderId: "942089219233",
	appId: "1:942089219233:web:4f4a7736325a0602ba94e0",
	measurementId: "G-FHVP7SJQLH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate 50 MCQ questions (addition, subtraction, multiplication, division)
export function generatePracticeQuestions() {
	const topics = ['addition', 'subtraction', 'multiplication', 'division'];
	const questions = [];
	for (let i = 0; i < 50; i++) {
		const topic = topics[Math.floor(Math.random() * topics.length)];
		let a, b, question = '', correctAnswer;
		switch (topic) {
			case 'addition':
				a = Math.floor(Math.random() * 100) + 1;
				b = Math.floor(Math.random() * 100) + 1;
				question = `${a} + ${b}`;
				correctAnswer = a + b;
				break;
			case 'subtraction':
				a = Math.floor(Math.random() * 100) + 1;
				b = Math.floor(Math.random() * a) + 1;
				question = `${a} - ${b}`;
				correctAnswer = a - b;
				break;
			case 'multiplication':
				a = Math.floor(Math.random() * 12) + 1;
				b = Math.floor(Math.random() * 12) + 1;
				question = `${a} × ${b}`;
				correctAnswer = a * b;
				break;
			case 'division':
				b = Math.floor(Math.random() * 12) + 1;
				correctAnswer = Math.floor(Math.random() * 12) + 1;
				a = b * correctAnswer;
				question = `${a} ÷ ${b}`;
				break;
			default:
				question = 'Error: Invalid topic';
				correctAnswer = 0;
		}
		// MCQ options (optimized)
		const options = [correctAnswer];
		let tries = 0;
		while (options.length < 4 && tries < 20) {
			let opt;
			switch (topic) {
				case 'addition':
				case 'subtraction':
					opt = correctAnswer + Math.floor(Math.random() * 20) - 10;
					break;
				case 'multiplication':
				case 'division':
					opt = correctAnswer + Math.floor(Math.random() * 6) - 3;
					break;
			}
			if (!options.includes(opt) && opt > 0) options.push(opt);
			tries++;
		}
		// Fill with random values if not enough options
		while (options.length < 4) {
			let opt = correctAnswer + Math.floor(Math.random() * 10) + 1;
			if (!options.includes(opt)) options.push(opt);
		}
		// Shuffle options
		for (let j = options.length - 1; j > 0; j--) {
			const k = Math.floor(Math.random() * (j + 1));
			[options[j], options[k]] = [options[k], options[j]];
		}
		questions.push({
			questionNumber: i + 1,
			question,
			topic,
			options,
			correctAnswer,
			userAnswer: null,
			isCorrect: false,
			timeTaken: 0
		});
	}
	console.log('Generated questions:', questions);
	return questions;
}

// Calculate stats for analytics
export function calculatePracticeStats(questions) {
	const topicStats = {};
	let score = 0;
	let totalTime = 0;
	let answeredCount = 0;
	questions.forEach(q => {
		if (!topicStats[q.topic]) {
			topicStats[q.topic] = { correct: 0, wrong: 0, total: 0 };
		}
		topicStats[q.topic].total++;
		if (q.userAnswer !== null) {
			answeredCount++;
			totalTime += q.timeTaken || 0;
			if (q.userAnswer === q.correctAnswer) {
				score++;
				topicStats[q.topic].correct++;
				q.isCorrect = true;
			} else {
				topicStats[q.topic].wrong++;
				q.isCorrect = false;
			}
		} else {
			topicStats[q.topic].wrong++;
			q.isCorrect = false;
		}
	});
	const averageTimePerQuestion = answeredCount ? (totalTime / answeredCount) : 0;
	return {
		score,
		topicStats,
		averageTimePerQuestion,
		answeredCount
	};
}

// Save attempt to Firestore
export async function savePracticeAttempt({ userId, email, questions, metrics }) {
	const attemptTimestamp = new Date().toISOString();
	const doc = {
		userId,
		email,
		questions,
		score: metrics.score,
		topicStats: metrics.topicStats,
		attemptTimestamp,
		metrics
	};
	await addDoc(collection(db, 'practice_tests'), doc);
}
