/**
 * nicknameGenerator.ts
 *
 * Generates and consistently retrieves random nicknames for users per context (e.g., proposal).
 * It uses a simple hash of the userId and contextId to deterministically pick words.
 */

const adjectives = [
    '대담한', '민첩한', '부지런한', '유능한', '상냥한', '침착한', '유연한', '든든한',
    '의젓한', '날카로운', '부드러운', '강인한', '순수한', '차가운', '빛나는', '평화로운',
    '강력한', '놀라운', '용의주도한', '섬세한', '낙천적인', '신속한', '튼튼한', '성공적인',
    '행복한', '자유로운', '신비로운', '단단한', '조용한', '신나는', '활발한', '의욕적인',
    '친근한', '매력적인', '귀여운', '용의있는', '부지런한', '재빠른', '영리한', '기특한',
    '우아한', '멋진', '단아한', '순한', '기특한', '놀라운', '의리있는', '건강한',
    '대범한', '성숙한', '풍부한', '자랑스러운', '화려한', '믿음직한', '날렵한', '독특한',
    '참신한', '기품있는', '온화한', '유능한', '깜찍한', '근면한', '끈기있는', '똑똑한',
    '총명한', '민감한', '자상한', '낭만적인', '호탕한', '유익한', '다부진', '대견한', '기쁜',
    '감명받은', '즐거운', '솜씨좋은', '힘쎈', '날쎈', '다재다능한', '사교적인', '사회화된',
    '지혜로운', '용감한', '호기심많은', '활기찬', '성실한', '따뜻한', '재치있는', '친절한',
    '사려깊은', '열정적인', '다정한', '당당한', '차분한', '쾌활한', '신중한', '명랑한',
    '예의바른', '겸손한', '정직한', '단호한', '기운찬', '슬기로운', '유쾌한', '기발한'
];

const animals = [
    '호랑이', '곰', '토끼', '사자', '강아지', '고양이', '여우', '다람쥐',
    '사슴', '독수리', '부엉이', '팬더', '거북이', '고래', '돌고래', '알파카',
    '기린', '펭귄', '코알라', '수달', '해달', '너구리', '햄스터', '앵무새', '원숭이',
    '상어', '바다사자', '사막여우', '올빼미', '참새', '넙치', '광어', '자라',
    '늑대', '표범', '치타', '하이에나', '하마', '코끼리', '얼룩말', '캥거루',
    '왈라비', '라마', '순록', '말', '당나귀', '염소', '양', '돼지', '해삼',
    '소', '물소', '들소', '바이슨', '두더지', '족제비', '밍크', '담비',
    '삵', '카피바라', '친칠라', '비버', '프레리도그', '미어캣', '고슴도치', '두루미',
    '황새', '까마귀', '까치', '매', '수리부엉이', '꿩', '닭', '오리',
    '거위', '백조', '플라밍고', '갈매기', '바다거북', '도마뱀', '카멜레온', '이구아나',
    '코브라', '아나콘다', '비단뱀', '가오리', '문어', '오징어', '해마', '해파리',
    '가재', '랍스터', '게', '개구리', '두꺼비', '도롱뇽', '불가사리', '말미잘'
];

/**
 * A simple string hashing function.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Generates a consistent random nickname for a given user in a specific context.
 * 
 * @param userId - The ID of the generic user (e.g., 'user_123')
 * @param contextId - The ID of the context (e.g., proposal ID 'prop_456')
 * @returns A string combining an adjective and an animal.
 */
export function generateNickname(userId: string, contextId: string): string {
    const combinedKey = `${userId}_${contextId}`;
    const hash = hashString(combinedKey);

    const adjIndex = hash % adjectives.length;
    // Use a shifted hash or another operation to ensure adj and animal aren't perfectly correlated
    const animalIndex = (hash >> 4) % animals.length;

    return `${adjectives[adjIndex]} ${animals[animalIndex]}`;
}
