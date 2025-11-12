// utils/translations.ts
export const translations = {
  en: {
    appTitle: 'Vocabulary Quiz Generator',
    appSubtitle: 'Import your vocabulary list and create interactive quizzes.',
    language: 'Language',
    // Section 1
    deckTitleLabel: 'Deck Name',
    pasteListLabel: 'Paste word list (CSV or TAB)',
    pasteListHelper: 'Supports formats: word,ipa,meaning or word,meaning',
    pasteListPlaceholder: 'hello\t/həˈloʊ/\tgreeting\n你好\tnǐ hǎo\txin chào',
    analyzeButton: 'Analyze',
    uploadFileButton: 'Upload File',
    exportCSVButton: 'Export CSV',
    exportJSONButton: 'Export JSON',
    // Section 2
    section2Title: 'Create Quiz',
    numQuestionsLabel: 'Number of questions',
    questionCountMax: '(max 20)',
    questionTypeLabel: 'Question type',
    mcqCheckboxLabel: 'Multiple Choice',
    tfCheckboxLabel: 'True/False',
    fillCheckboxLabel: 'Fill-in',
    createQuizButton: 'Create Quiz',
    quizDisabledNoteMCQ: 'Note: Multiple choice requires at least 4 words.',
    quizDisabledNoteTF: 'Note: True/False requires at least 2 words.',
    // Preview
    previewTitle: 'Preview',
    itemsSuffix: 'items',
    colWord: 'Word',
    colIPA: 'IPA',
    colMeaning: 'Meaning',
    previewPlaceholder: 'Paste or upload data to see a preview.',
    previewTip: 'Tip: Add more items with different meanings to create better distractors for multiple-choice questions.',
    // Quiz Area
    quizPlaceholderTitle: 'Your quiz will appear here.',
    quizPlaceholderSubtitle: 'Create a quiz from your vocabulary list to get started.',
    alertAddWords: 'Please add some vocabulary words first to create a quiz.',
    alertSelectQuizType: 'Please select at least one question type.',
    // Quiz Runner
    quizTitle: 'Quiz',
    questionsSuffix: 'questions',
    scoreLabel: 'Score',
    submitButton: 'Submit Answers',
    retakeButton: 'Take Another Quiz',
    exportQuizButton: 'Export Quiz JSON',
    tfStatement: 'Statement',
    fillPlaceholder: 'Type the meaning...',
    correctMessage: 'Correct!',
    incorrectMessagePrefix: 'Correct answer',
  },
  vi: {
    appTitle: 'Trình tạo bài tập từ vựng',
    appSubtitle: 'Nhập danh sách từ vựng và tạo bài kiểm tra tương tác',
    language: 'Ngôn ngữ',
    // Section 1
    deckTitleLabel: 'Tên bộ từ',
    pasteListLabel: 'Dán danh sách từ (CSV hoặc TAB)',
    pasteListHelper: 'Hỗ trợ các dạng: từ,phiên âm,nghĩa hoặc từ,nghĩa',
    pasteListPlaceholder: 'hello\t/həˈloʊ/\tgreeting\n你好\tnǐ hǎo\txin chào',
    analyzeButton: 'Phân tích',
    uploadFileButton: 'Tải file lên',
    exportCSVButton: 'Xuất CSV',
    exportJSONButton: 'Xuất JSON',
    // Section 2
    section2Title: 'Tạo bài kiểm tra',
    numQuestionsLabel: 'Số câu hỏi',
    questionCountMax: '(tối đa 20)',
    questionTypeLabel: 'Loại câu hỏi',
    mcqCheckboxLabel: 'Trắc nghiệm',
    tfCheckboxLabel: 'Đúng/Sai',
    fillCheckboxLabel: 'Điền từ',
    createQuizButton: 'Tạo bài kiểm tra',
    quizDisabledNoteMCQ: 'Lưu ý: Trắc nghiệm yêu cầu ít nhất 4 từ.',
    quizDisabledNoteTF: 'Lưu ý: Đúng/Sai yêu cầu ít nhất 2 từ.',
    // Preview
    previewTitle: 'Xem trước',
    itemsSuffix: 'mục',
    colWord: 'Từ',
    colIPA: 'Phiên âm',
    colMeaning: 'Nghĩa',
    previewPlaceholder: 'Dán hoặc tải dữ liệu lên để xem trước.',
    previewTip: 'Mẹo: Thêm nhiều mục với nghĩa khác nhau để tạo câu trả lời nhiễu tốt hơn cho bài trắc nghiệm.',
    // Quiz Area
    quizPlaceholderTitle: 'Bài kiểm tra của bạn sẽ xuất hiện ở đây.',
    quizPlaceholderSubtitle: 'Tạo một bài kiểm tra từ danh sách từ vựng của bạn để bắt đầu.',
    alertAddWords: 'Vui lòng thêm một số từ vựng trước khi tạo bài kiểm tra.',
    alertSelectQuizType: 'Vui lòng chọn ít nhất một loại câu hỏi.',
    // Quiz Runner
    quizTitle: 'Bài kiểm tra',
    questionsSuffix: 'câu hỏi',
    scoreLabel: 'Điểm',
    submitButton: 'Nộp bài',
    retakeButton: 'Làm bài kiểm tra khác',
    exportQuizButton: 'Xuất Quiz JSON',
    tfStatement: 'Mệnh đề',
    fillPlaceholder: 'Nhập nghĩa của từ...',
    correctMessage: 'Chính xác!',
    incorrectMessagePrefix: 'Đáp án đúng',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export const useTranslation = (lang: Language) => {
    return (key: TranslationKey): string => {
        const text = (translations[lang] as Record<TranslationKey, string>)[key];
        return text || key;
    }
}