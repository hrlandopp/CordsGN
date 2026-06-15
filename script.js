/**
 * GuitarChord Pro - Motor de Teoría Musical, Generador Vectorial e Interfaz UI
 * Arquitectura: Vanilla JS (ES6+) con base de datos explícita de voicings de conservatorio.
 */

document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    /* ==========================================================================
       1. MOTOR DE TEORÍA MUSICAL
       ========================================================================== */
    const Theory = {
        NOTES_SHARP: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
        NOTES_FLAT:  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
        
        SCALE_INTERVALS: {
            'major-natural':   [0, 2, 4, 5, 7, 9, 11],
            'minor-natural':   [0, 2, 3, 5, 7, 8, 10],
            'minor-harmonic':  [0, 2, 3, 5, 7, 8, 11],
            'minor-melodic':   [0, 2, 3, 5, 7, 9, 11]
        },

        DIATONIC_MAPPING: {
            'major-natural': [
                { numeral: 'I', quality: 'Maj' }, { numeral: 'ii', quality: 'min' },
                { numeral: 'iii', quality: 'min' }, { numeral: 'IV', quality: 'Maj' },
                { numeral: 'V', quality: '7' }, { numeral: 'vi', quality: 'min' },
                { numeral: 'vii°', quality: 'dim' }
            ],
            'minor-natural': [
                { numeral: 'i', quality: 'min' }, { numeral: 'ii°', quality: 'dim' },
                { numeral: 'III', quality: 'Maj' }, { numeral: 'iv', quality: 'min' },
                { numeral: 'v', quality: 'min' }, { numeral: 'VI', quality: 'Maj' },
                { numeral: 'VII', quality: '7' }
            ],
            'minor-harmonic': [
                { numeral: 'i', quality: 'mMaj7' }, { numeral: 'ii°', quality: 'dim' },
                { numeral: 'III+', quality: 'Aug' }, { numeral: 'iv', quality: 'min' },
                { numeral: 'V', quality: '7' }, { numeral: 'VI', quality: 'Maj' },
                { numeral: 'vii°', quality: 'dim7' }
            ],
            'minor-melodic': [
                { numeral: 'i', quality: 'mMaj7' }, { numeral: 'ii', quality: 'min' },
                { numeral: 'III+', quality: 'Aug' }, { numeral: 'IV', quality: 'Maj' },
                { numeral: 'V', quality: '7' }, { numeral: 'vi°', quality: 'm7b5' },
                { numeral: 'vii°', quality: 'dim7' }
            ]
        },

        getNoteSpelling(noteIndex, expectedLetter) {
            const sharpNote = this.NOTES_SHARP[noteIndex];
            const flatNote = this.NOTES_FLAT[noteIndex];
            
            if (sharpNote[0] === expectedLetter) return sharpNote;
            if (flatNote[0] === expectedLetter) return flatNote;
            
            // Corrección enarmónica estricta para notas fuera de armaduras comunes
            if (expectedLetter === 'C' && sharpNote === 'B') return 'B#';
            if (expectedLetter === 'F' && sharpNote === 'E') return 'E#';
            if (expectedLetter === 'B' && flatNote === 'C') return 'Cb';
            if (expectedLetter === 'E' && flatNote === 'F') return 'Fb';
            
            return sharpNote;
        },

        generateDiatonicChords(rootName, mode) {
            let rootIndex = this.NOTES_SHARP.indexOf(rootName);
            if (rootIndex === -1) rootIndex = this.NOTES_FLAT.indexOf(rootName);

            const intervals = this.SCALE_INTERVALS[mode];
            const mapping = this.DIATONIC_MAPPING[mode];

            const ALPHABET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const rootAlphaIdx = ALPHABET.indexOf(rootName[0]);

            return mapping.map((degree, index) => {
                const noteIndex = (rootIndex + intervals[index]) % 12;
                const expectedLetter = ALPHABET[(rootAlphaIdx + index) % 7];
                const noteSpelling = this.getNoteSpelling(noteIndex, expectedLetter);

                return {
                    degree: degree.numeral,
                    degreeIndex: index,
                    rootNote: noteSpelling,
                    quality: degree.quality,
                    fullName: `${noteSpelling} ${degree.quality}`
                };
            });
        },

        generateScaleNotes(rootName, mode) {
            let rootIndex = this.NOTES_SHARP.indexOf(rootName);
            if (rootIndex === -1) rootIndex = this.NOTES_FLAT.indexOf(rootName);

            const intervals = this.SCALE_INTERVALS[mode];
            const ALPHABET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const rootAlphaIdx = ALPHABET.indexOf(rootName[0]);

            return intervals.map((interval, index) => {
                const noteIndex = (rootIndex + interval) % 12;
                const expectedLetter = ALPHABET[(rootAlphaIdx + index) % 7];
                return this.getNoteSpelling(noteIndex, expectedLetter);
            });
        }
    };

    /* ==========================================================================
       2. BASE DE DATOS DE ACORDES (CHORD_DATABASE)
       ========================================================================== */
    const CHORD_DATABASE = {
        'A': {
            'Maj': [
                { frets: ['X', 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
                { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], baseFret: 5, barre: { fret: 5, from: 0, to: 5 } },
                { frets: ['X', 'X', 7, 9, 10, 9], fingers: [0, 0, 1, 2, 4, 3], baseFret: 7 }
            ],
            '6': [ { frets: ['X', 0, 2, 2, 2, 2], fingers: [0, 0, 1, 2, 3, 4], baseFret: 1 } ],
            'm6': [ { frets: ['X', 0, 2, 2, 1, 2], fingers: [0, 0, 2, 3, 1, 4], baseFret: 1 } ],
            'sus2': [ { frets: ['X', 0, 2, 2, 0, 0], fingers: [0, 0, 2, 3, 0, 0], baseFret: 1 } ], // A E A B E -> Correcto
            'sus4': [ { frets: ['X', 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 4, 0], baseFret: 1 } ],
            'add9': [ { frets: ['X', 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0], baseFret: 1 } ], // A E C# B E -> Correcto
            '9': [ { frets: [5, 7, 5, 6, 5, 7], fingers: [1, 3, 1, 2, 1, 4], baseFret: 5, barre: { fret: 5, from: 0, to: 5 } } ],
            'm9': [ { frets: [5, 7, 5, 5, 5, 7], fingers: [1, 3, 1, 1, 1, 4], baseFret: 5, barre: { fret: 5, from: 0, to: 5 } } ],
            'Maj9': [ { frets: ['X', 0, 2, 1, 2, 2], fingers: [0, 0, 2, 1, 3, 4], baseFret: 1 } ],
            'min': [
                { frets: ['X', 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
                { frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], baseFret: 5, barre: { fret: 5, from: 0, to: 5 } },
                { frets: ['X', 'X', 7, 9, 10, 8], fingers: [0, 0, 1, 3, 4, 2], baseFret: 7 }
            ],
            '7': [
                { frets: ['X', 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], baseFret: 1 },
                { frets: [5, 7, 5, 6, 5, 5], fingers: [1, 3, 1, 2, 1, 1], baseFret: 5, barre: { fret: 5, from: 0, to: 5 } }
            ],
            'm7': [
                { frets: ['X', 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], baseFret: 1 },
                { frets: [5, 7, 5, 5, 5, 5], fingers: [1, 3, 1, 1, 1, 1], baseFret: 5, barre: { fret: 5, from: 0, to: 5 } }
            ],
            'Maj7': [
                { frets: ['X', 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], baseFret: 1 },
                { frets: [5, 'X', 6, 6, 5, 'X'], fingers: [1, 0, 2, 3, 1, 0], baseFret: 5 }
            ],
            'dim': [ { frets: ['X', 0, 1, 2, 1, 'X'], fingers: [0, 0, 1, 3, 2, 0], baseFret: 1 } ],
            'dim7': [ { frets: ['X', 0, 1, 2, 1, 2], fingers: [0, 0, 1, 3, 2, 4], baseFret: 1 } ],
            'm7b5': [ { frets: ['X', 0, 1, 0, 1, 'X'], fingers: [0, 0, 1, 0, 2, 0], baseFret: 1 } ],
            'Aug': [ { frets: ['X', 0, 3, 2, 2, 1], fingers: [0, 0, 4, 2, 3, 1], baseFret: 1 } ],
            'mMaj7': [ { frets: ['X', 0, 2, 1, 1, 0], fingers: [0, 0, 3, 1, 2, 0], baseFret: 1 } ]
        },
        'B': {
            'Maj': [
                { frets: ['X', 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
                { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], baseFret: 7, barre: { fret: 7, from: 0, to: 5 } }
            ],
            'min': [
                { frets: ['X', 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
                { frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1], baseFret: 7, barre: { fret: 7, from: 0, to: 5 } }
            ],
            '7': [
                { frets: ['X', 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1 },
                { frets: ['X', 2, 4, 2, 4, 2], fingers: [0, 1, 3, 1, 4, 1], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } }
            ],
            'm7': [
                { frets: ['X', 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } },
                { frets: [7, 9, 7, 7, 7, 7], fingers: [1, 3, 1, 1, 1, 1], baseFret: 7, barre: { fret: 7, from: 0, to: 5 } }
            ],
            'Maj7': [ { frets: ['X', 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } } ],
            'dim': [ { frets: ['X', 2, 3, 4, 3, 'X'], fingers: [0, 1, 2, 4, 3, 0], baseFret: 2 } ],
            'dim7': [ { frets: ['X', 2, 3, 1, 3, 'X'], fingers: [0, 2, 3, 1, 4, 0], baseFret: 1 } ],
            'm7b5': [ { frets: ['X', 2, 3, 2, 3, 'X'], fingers: [0, 1, 3, 2, 4, 0], baseFret: 2 } ],
            'Aug': [ { frets: ['X', 2, 1, 0, 0, 3], fingers: [0, 2, 1, 0, 0, 4], baseFret: 1 } ],
            'mMaj7': [ { frets: ['X', 2, 4, 3, 3, 2], fingers: [0, 1, 4, 2, 3, 1], baseFret: 2, barre: { fret: 2, from: 1, to: 5 } } ]
        },
        'C': {
            'Maj': [
                { frets: ['X', 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
                { frets: ['X', 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } },
                { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], baseFret: 8, barre: { fret: 8, from: 0, to: 5 } }
            ],
            '6': [ { frets: ['X', 3, 2, 2, 1, 0], fingers: [0, 4, 2, 3, 1, 0], baseFret: 1 } ],
            'm6': [ { frets: [8, 10, 10, 8, 9, 8], fingers: [1, 3, 4, 1, 2, 1], baseFret: 8, barre: { fret: 8, from: 0, to: 5 } } ],
            'sus2': [ { frets: ['X', 3, 0, 0, 3, 'X'], fingers: [0, 2, 0, 0, 3, 0], baseFret: 1 } ], // C G C D -> Correcto
            'sus4': [ { frets: ['X', 3, 3, 0, 1, 'X'], fingers: [0, 3, 4, 0, 1, 0], baseFret: 1 } ],
            'add9': [ { frets: ['X', 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], baseFret: 1 } ], // C E G D G -> Correcto
            '9': [ { frets: [8, 10, 8, 9, 8, 10], fingers: [1, 3, 1, 2, 1, 4], baseFret: 8, barre: { fret: 8, from: 0, to: 5 } } ],
            'm9': [ { frets: [8, 10, 8, 8, 8, 10], fingers: [1, 3, 1, 1, 1, 4], baseFret: 8, barre: { fret: 8, from: 0, to: 5 } } ],
            'Maj9': [ { frets: ['X', 3, 2, 4, 3, 'X'], fingers: [0, 2, 1, 4, 3, 0], baseFret: 2 } ],
            'min': [
                { frets: ['X', 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } },
                { frets: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1], baseFret: 8, barre: { fret: 8, from: 0, to: 5 } }
            ],
            '7': [
                { frets: ['X', 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
                { frets: ['X', 3, 5, 3, 5, 3], fingers: [0, 1, 3, 1, 4, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } }
            ],
            'm7': [
                { frets: ['X', 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } },
                { frets: [8, 10, 8, 8, 8, 8], fingers: [1, 3, 1, 1, 1, 1], baseFret: 8, barre: { fret: 8, from: 0, to: 5 } }
            ],
            'Maj7': [ { frets: ['X', 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1 } ],
            'dim': [ { frets: ['X', 3, 4, 5, 4, 'X'], fingers: [0, 1, 2, 4, 3, 0], baseFret: 3 } ],
            'dim7': [ { frets: ['X', 3, 4, 2, 4, 'X'], fingers: [0, 2, 3, 1, 4, 0], baseFret: 2 } ],
            'm7b5': [ { frets: ['X', 3, 4, 3, 4, 'X'], fingers: [0, 1, 3, 2, 4, 0], baseFret: 3 } ],
            'Aug': [ { frets: ['X', 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], baseFret: 1 } ],
            'mMaj7': [ { frets: ['X', 3, 5, 4, 4, 3], fingers: [0, 1, 4, 2, 3, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 } } ]
        },
        'D': {
            'Maj': [
                { frets: ['X', 'X', 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
                { frets: ['X', 5, 7, 7, 7, 5], fingers: [0, 1, 2, 3, 4, 1], baseFret: 5, barre: { fret: 5, from: 1, to: 5 } },
                { frets: [10, 12, 12, 11, 10, 10], fingers: [1, 3, 4, 2, 1, 1], baseFret: 10, barre: { fret: 10, from: 0, to: 5 } }
            ],
            'min': [
                { frets: ['X', 'X', 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
                { frets: ['X', 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], baseFret: 5, barre: { fret: 5, from: 1, to: 5 } }
            ],
            '7': [
                { frets: ['X', 'X', 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1 },
                { frets: ['X', 5, 7, 5, 7, 5], fingers: [0, 1, 3, 1, 4, 1], baseFret: 5, barre: { fret: 5, from: 1, to: 5 } }
            ],
            'm7': [
                { frets: ['X', 'X', 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 4, to: 5 } },
                { frets: ['X', 5, 7, 5, 6, 5], fingers: [0, 1, 3, 1, 2, 1], baseFret: 5, barre: { fret: 5, from: 1, to: 5 } }
            ],
            'Maj7': [ { frets: ['X', 'X', 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], baseFret: 1, barre: { fret: 2, from: 3, to: 5 } } ],
            'dim': [ { frets: ['X', 'X', 0, 1, 3, 1], fingers: [0, 0, 0, 1, 4, 2], baseFret: 1 } ],
            'dim7': [ { frets: ['X', 'X', 0, 1, 0, 1], fingers: [0, 0, 0, 1, 0, 2], baseFret: 1 } ],
            'm7b5': [ { frets: ['X', 'X', 0, 1, 1, 1], fingers: [0, 0, 0, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 3, to: 5 } } ],
            'Aug': [ { frets: ['X', 'X', 0, 3, 3, 2], fingers: [0, 0, 0, 3, 4, 1], baseFret: 1 } ],
            'mMaj7': [ { frets: ['X', 'X', 0, 2, 2, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 } ]
        },
        'E': {
            'Maj': [
                { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
                { frets: ['X', 7, 9, 9, 9, 7], fingers: [0, 1, 2, 3, 4, 1], baseFret: 7, barre: { fret: 7, from: 1, to: 5 } }
            ],
            'min': [
                { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
                { frets: ['X', 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], baseFret: 7, barre: { fret: 7, from: 1, to: 5 } }
            ],
            '7': [
                { frets: [0, 2, 0, 1, 3, 0], fingers: [0, 2, 0, 1, 4, 0], baseFret: 1 },
                { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1 }
            ],
            'm7': [
                { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0], baseFret: 1 },
                { frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 4, 0], baseFret: 1 }
            ],
            'Maj7': [ { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], baseFret: 1 } ],
            'dim': [ { frets: [0, 1, 2, 0, 'X', 'X'], fingers: [0, 1, 3, 0, 0, 0], baseFret: 1 } ],
            'dim7': [ { frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], baseFret: 1 } ],
            'm7b5': [ { frets: [0, 1, 0, 0, 3, 0], fingers: [0, 1, 0, 0, 4, 0], baseFret: 1 } ],
            'Aug': [ { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], baseFret: 1 } ],
            'mMaj7': [ { frets: [0, 2, 1, 0, 0, 0], fingers: [0, 3, 1, 0, 0, 0], baseFret: 1 } ]
        },
        'F': {
            'Maj': [
                { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
                { frets: ['X', 8, 10, 10, 10, 8], fingers: [0, 1, 2, 3, 4, 1], baseFret: 8, barre: { fret: 8, from: 1, to: 5 } }
            ],
            'min': [
                { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
                { frets: ['X', 8, 10, 10, 9, 8], fingers: [0, 1, 3, 4, 2, 1], baseFret: 8, barre: { fret: 8, from: 1, to: 5 } }
            ],
            '7': [
                { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
                { frets: ['X', 8, 10, 8, 10, 8], fingers: [0, 1, 3, 1, 4, 1], baseFret: 8, barre: { fret: 8, from: 1, to: 5 } }
            ],
            'm7': [
                { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } },
                { frets: ['X', 8, 10, 8, 9, 8], fingers: [0, 1, 3, 1, 2, 1], baseFret: 8, barre: { fret: 8, from: 1, to: 5 } }
            ],
            'Maj7': [ { frets: ['X', 'X', 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], baseFret: 1 } ],
            'dim': [ { frets: [1, 'X', 0, 1, 0, 'X'], fingers: [2, 0, 0, 3, 0, 0], baseFret: 1 } ],
            'dim7': [ { frets: [1, 'X', 0, 1, 0, 1], fingers: [2, 0, 0, 3, 0, 4], baseFret: 1 } ],
            'm7b5': [ { frets: [1, 'X', 1, 1, 0, 'X'], fingers: [2, 0, 3, 4, 0, 0], baseFret: 1 } ],
            'Aug': [ { frets: [1, 'X', 3, 2, 2, 1], fingers: [1, 0, 4, 2, 3, 1], baseFret: 1 } ],
            'mMaj7': [ { frets: [1, 3, 2, 1, 1, 1], fingers: [1, 4, 3, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 } } ]
        },
        'G': {
            'Maj': [
                { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, 0, 0, 0, 4], baseFret: 1 },
                { frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } },
                { frets: ['X', 10, 12, 12, 12, 10], fingers: [0, 1, 2, 3, 4, 1], baseFret: 10, barre: { fret: 10, from: 1, to: 5 } }
            ],
            '6': [ { frets: [3, 2, 0, 0, 0, 0], fingers: [3, 2, 0, 0, 0, 0], baseFret: 1 } ],
            'm6': [ { frets: [3, 'X', 2, 3, 3, 3], fingers: [2, 0, 1, 3, 4, 4], baseFret: 2 } ],
            'sus2': [ { frets: ['X', 10, 12, 12, 10, 'X'], fingers: [0, 1, 3, 4, 2, 0], baseFret: 10 } ], // G D G A -> Correcto
            'sus4': [ { frets: [3, 3, 0, 0, 1, 3], fingers: [3, 4, 0, 0, 1, 3], baseFret: 1 } ],
            'add9': [ { frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], baseFret: 1 } ], // G B D G D G (A is implied or omitted, common voicing)
            '9': [ { frets: [10, 12, 10, 11, 10, 12], fingers: [1, 3, 1, 2, 1, 4], baseFret: 10, barre: { fret: 10, from: 0, to: 5 } } ],
            'm9': [ { frets: [10, 12, 10, 10, 10, 12], fingers: [1, 3, 1, 1, 1, 4], baseFret: 10, barre: { fret: 10, from: 0, to: 5 } } ],
            'Maj9': [ { frets: [3, 'X', 4, 2, 3, 'X'], fingers: [2, 0, 4, 1, 3, 0], baseFret: 2 } ],
            'min': [
                { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } },
                { frets: ['X', 10, 12, 12, 11, 10], fingers: [0, 1, 3, 4, 2, 1], baseFret: 10, barre: { fret: 10, from: 1, to: 5 } }
            ],
            '7': [
                { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1 },
                { frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } }
            ],
            'm7': [
                { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } },
                { frets: ['X', 10, 12, 10, 11, 10], fingers: [0, 1, 3, 1, 2, 1], baseFret: 10, barre: { fret: 10, from: 1, to: 5 } }
            ],
            'Maj7': [ { frets: [3, 'X', 4, 4, 3, 'X'], fingers: [1, 0, 3, 4, 2, 0], baseFret: 3 } ],
            'dim': [ { frets: [3, 'X', 2, 3, 2, 'X'], fingers: [2, 0, 1, 3, 1, 0], baseFret: 2 } ],
            'dim7': [ { frets: [3, 'X', 2, 3, 2, 3], fingers: [2, 0, 1, 3, 1, 4], baseFret: 2 } ],
            'm7b5': [ { frets: [3, 'X', 3, 3, 2, 'X'], fingers: [2, 0, 3, 4, 1, 0], baseFret: 2 } ],
            'Aug': [ { frets: [3, 'X', 1, 0, 0, 3], fingers: [3, 0, 1, 0, 0, 4], baseFret: 1 } ],
            'mMaj7': [ { frets: [3, 5, 4, 3, 3, 3], fingers: [1, 4, 3, 1, 1, 1], baseFret: 3, barre: { fret: 3, from: 0, to: 5 } } ]
        }
    };

    /* ==========================================================================
       3. MOTOR DE GENERACIÓN Y TRANSPOSICIÓN
       ========================================================================== */
    const GuitarEngine = {
        UNIVERSAL_SHAPES: {
            'Maj': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 }, rootString: 6, rootFret: 1 },
            'min': { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 }, rootString: 6, rootFret: 1 },
            '7': { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 }, rootString: 6, rootFret: 1 },
            'm7': { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], baseFret: 1, barre: { fret: 1, from: 0, to: 5 }, rootString: 6, rootFret: 1 },
            'Maj7': { frets: ['X', 3, 5, 4, 5, 3], fingers: [0, 1, 3, 2, 4, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 }, rootString: 5, rootFret: 3 },
            'dim': { frets: ['X', 3, 4, 5, 4, 'X'], fingers: [0, 1, 2, 4, 3, 0], baseFret: 3, rootString: 5, rootFret: 3 },
            'dim7': { frets: ['X', 3, 4, 2, 4, 'X'], fingers: [0, 2, 3, 1, 4, 0], baseFret: 2, rootString: 5, rootFret: 3 },
            'm7b5': { frets: ['X', 3, 4, 3, 4, 'X'], fingers: [0, 1, 3, 2, 4, 0], baseFret: 3, rootString: 5, rootFret: 3 },
            'Aug': { frets: [1, 'X', 3, 2, 2, 1], fingers: [1, 0, 4, 2, 3, 1], baseFret: 1, rootString: 6, rootFret: 1 },
            'mMaj7': { frets: ['X', 3, 5, 4, 4, 3], fingers: [0, 1, 4, 2, 3, 1], baseFret: 3, barre: { fret: 3, from: 1, to: 5 }, rootString: 5, rootFret: 3 }
        },

        // Transpone un voicing completo sumando un offset a los trastes
        shiftVoicing(voicing, offset) {
            let newFrets = voicing.frets.map(f => (f === 'X' || f === 0 && offset === 0) ? f : (f === 0 ? offset : f + offset));
            
            let newBaseFret = voicing.baseFret;
            if (offset > 0 && voicing.baseFret === 1) {
                const fretted = newFrets.filter(f => f !== 'X' && f > 0);
                newBaseFret = fretted.length > 0 ? Math.min(...fretted) : 1;
            } else if (offset > 0) {
                newBaseFret += offset;
            }

            let newBarre = null;
            if (voicing.barre) {
                newBarre = { fret: voicing.barre.fret + offset, from: voicing.barre.from, to: voicing.barre.to };
            } else if (offset > 0) {
                // Generar cejilla si había cuerdas al aire
                const openStringsIndices = voicing.frets.reduce((acc, curr, idx) => {
                    if (curr === 0) acc.push(idx); return acc;
                }, []);
                
                if (openStringsIndices.length >= 2) {
                    newBarre = { fret: offset, from: Math.min(...openStringsIndices), to: Math.max(...openStringsIndices) };
                }
            }

            return { frets: newFrets, fingers: voicing.fingers, baseFret: newBaseFret, barre: newBarre };
        },

        getUniversalMovableShape(targetNote, quality) {
            const shape = this.UNIVERSAL_SHAPES[quality];
            if (!shape) return null;

            const chromatic5th = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
            const chromatic5thFlat = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
            
            const chromatic6th = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];
            const chromatic6thFlat = ['E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb'];

            let targetFret = 0;
            if (shape.rootString === 5) {
                targetFret = chromatic5th.indexOf(targetNote);
                if (targetFret === -1) targetFret = chromatic5thFlat.indexOf(targetNote);
            } else {
                targetFret = chromatic6th.indexOf(targetNote);
                if (targetFret === -1) targetFret = chromatic6thFlat.indexOf(targetNote);
            }

            if (targetFret === 0) targetFret = 12;

            const offset = targetFret - shape.rootFret;
            const cleanShape = { frets: shape.frets, fingers: shape.fingers, baseFret: shape.baseFret };
            if (shape.barre) cleanShape.barre = shape.barre;

            return this.shiftVoicing(cleanShape, offset);
        },

        // Obtiene o calcula los voicings para cualquier nota y calidad
        getVoicings(rootNote, quality) {
            // Eliminar alteraciones temporales para buscar en DB
            const isSharp = rootNote.includes('#');
            const isFlat = rootNote.includes('b');
            const baseNote = isSharp ? rootNote[0] : (isFlat ? rootNote[0] : rootNote);
            
            let offset = 0;
            if (isSharp) offset = 1;
            if (isFlat) offset = -1; // En guitarra estándar, un bemol de A es Ab, pero usamos enharmónicos
            
            // Corrección de bemoles a sostenidos para simplificar la matemática (Eb = D#, offset de D = +1)
            let searchNote = baseNote;
            if (isFlat) {
                const flatIndex = Theory.NOTES_FLAT.indexOf(rootNote);
                if(flatIndex !== -1) {
                    const sharpEquivalent = Theory.NOTES_SHARP[flatIndex];
                    searchNote = sharpEquivalent[0];
                    offset = sharpEquivalent.includes('#') ? 1 : 0;
                }
            }

            const dbQualities = CHORD_DATABASE[searchNote];
            let targetQualities = dbQualities ? (dbQualities[quality] || dbQualities['Maj']) : [];

            // Si no hay offset, devolver la base de datos directa
            if (offset === 0) return targetQualities.slice(0, 5);

            // 1. Filtrar posiciones abiertas (al aire) para evitar transponerlas matemáticamente
            let closedVoicings = targetQualities.filter(v => !v.frets.includes(0));
            
            let shiftedVoicings = [];

            if (closedVoicings.length > 0) {
                shiftedVoicings = closedVoicings.map(v => this.shiftVoicing(v, offset));
                shiftedVoicings = shiftedVoicings.filter(v => v.baseFret > 0 && v.baseFret < 14);
            }

            // 2. Fallback: si se descartaron las abiertas y no quedaron opciones, usar molde CAGED universal
            if (shiftedVoicings.length === 0) {
                const fallbackShape = this.getUniversalMovableShape(rootNote, quality);
                if (fallbackShape && fallbackShape.baseFret > 0 && fallbackShape.baseFret < 14) {
                    shiftedVoicings.push(fallbackShape);
                }
            }
            
            // 3. Respaldo final absoluto por seguridad estructural
            if (shiftedVoicings.length === 0) {
                shiftedVoicings.push(this.shiftVoicing(CHORD_DATABASE['A']['Maj'][1], 0));
            }

            return shiftedVoicings.slice(0, 5);
        }
    };

    /* ==========================================================================
       4. CONSTRUCTOR DE SVG Y RENDERIZADO VISUAL
       ========================================================================== */
    const UIBuilder = {
        SVG_NS: "http://www.w3.org/2000/svg",

        createSVGElement(tag, attributes = {}) {
            const el = document.createElementNS(this.SVG_NS, tag);
            for (const [key, value] of Object.entries(attributes)) {
                el.setAttribute(key, value);
            }
            return el;
        },

        buildSVG(voicing, chordName) {
            const svg = this.createSVGElement('svg', {
                class: 'chord-svg', viewBox: '0 0 120 140', 'aria-label': `Diagrama de ${chordName}`
            });

            // Marcadores Superiores (X, O)
            const markersGrp = this.createSVGElement('g', { class: 'chord-svg__top-markers' });
            voicing.frets.forEach((fret, i) => {
                const xPos = 15 + (i * 18);
                let text = '';
                let className = 'chord-svg__marker ';
                if (fret === 'X') { text = 'X'; className += 'chord-svg__marker--mute'; }
                else if (fret === 0) { text = 'O'; className += 'chord-svg__marker--open'; }
                
                if (text) {
                    const txtEl = this.createSVGElement('text', { x: xPos, y: 15, class: className, 'text-anchor': 'middle' });
                    txtEl.textContent = text;
                    markersGrp.appendChild(txtEl);
                }
            });
            svg.appendChild(markersGrp);

            // Cuadrícula (Cuerdas y Trastes)
            const gridGrp = this.createSVGElement('g', { class: 'chord-svg__grid', transform: 'translate(15, 25)' });
            const strokeWidths = [2.5, 2, 1.5, 1, 0.8, 0.5];
            
            for (let i = 0; i < 6; i++) {
                gridGrp.appendChild(this.createSVGElement('path', {
                    class: 'chord-svg__string', d: `M ${i * 18} 0 V 100`, stroke: '#000', 'stroke-width': strokeWidths[i]
                }));
            }

            for (let i = 0; i <= 4; i++) {
                const isNut = (voicing.baseFret === 1 && i === 0);
                gridGrp.appendChild(this.createSVGElement('path', {
                    class: `chord-svg__fret ${isNut ? 'chord-svg__fret--nut' : ''}`,
                    d: `M 0 ${i * 25} H 90`, stroke: '#000', 'stroke-width': isNut ? 4 : 1
                }));
            }

            if (voicing.baseFret > 1) {
                const fretIndicator = this.createSVGElement('text', {
                    x: -12, y: 17, 'font-size': '12', 'font-family': 'sans-serif', 'text-anchor': 'end'
                });
                fretIndicator.textContent = `${voicing.baseFret}fr`;
                gridGrp.appendChild(fretIndicator);
            }
            svg.appendChild(gridGrp);

            // Cejilla (Barre) Profesional
            if (voicing.barre) {
                const bY = (voicing.barre.fret - voicing.baseFret) * 25 + 12.5;
                const bX = voicing.barre.from * 18;
                const bWidth = (voicing.barre.to - voicing.barre.from) * 18;
                
                const barreGrp = this.createSVGElement('g', { transform: 'translate(15, 25)' });
                barreGrp.appendChild(this.createSVGElement('rect', {
                    class: 'chord-svg__barre', x: bX - 4, y: bY - 8, width: bWidth + 8, height: 16, rx: 8, fill: '#1a1a1a'
                }));
                svg.appendChild(barreGrp);
            }

            // Posiciones de Dedos
            const fingersGrp = this.createSVGElement('g', { class: 'chord-svg__fingers', transform: 'translate(15, 25)' });
            voicing.frets.forEach((fret, strIdx) => {
                if (fret !== 'X' && fret > 0 && fret >= voicing.baseFret) {
                    // Omitir dibujo individual si está perfectamente cubierto por la cejilla para mantener limpieza visual
                    if (voicing.barre && fret === voicing.barre.fret && strIdx >= voicing.barre.from && strIdx <= voicing.barre.to) return;
                    
                    const fX = strIdx * 18;
                    const fY = (fret - voicing.baseFret) * 25 + 12.5;
                    const fingerNum = voicing.fingers[strIdx];

                    const dotGrp = this.createSVGElement('g', { class: 'chord-svg__finger', transform: `translate(${fX}, ${fY})` });
                    dotGrp.appendChild(this.createSVGElement('circle', { cx: 0, cy: 0, r: 7, fill: '#000' }));
                    
                    if (fingerNum > 0) {
                        const txt = this.createSVGElement('text', { x: 0, y: 3, fill: '#fff', 'font-size': 10, 'font-family': 'sans-serif', 'text-anchor': 'middle' });
                        txt.textContent = fingerNum;
                        dotGrp.appendChild(txt);
                    }
                    fingersGrp.appendChild(dotGrp);
                }
            });
            svg.appendChild(fingersGrp);

            return svg;
        },

        createChordCell(chordData, voicing, index) {
            const section = document.createElement('section');
            section.className = 'chord-cell';
            
            section.innerHTML = `
                <header class="chord-cell__header">
                    <span class="chord-cell__degree">Grado ${chordData.degree}</span>
                    <h3 class="chord-cell__name">${chordData.fullName}</h3>
                </header>
                <div class="chord-svg-container"></div>
                <footer class="chord-cell__footer">
                    <button class="button button--secondary button--edit" type="button" data-index="${index}">
                        <span class="button__icon">✏️</span> Editar Variación
                    </button>
                </footer>
            `;
            
            section.querySelector('.chord-svg-container').appendChild(this.buildSVG(voicing, chordData.fullName));
            return section;
        }
    };

    /* ==========================================================================
       5. CONTROLADOR APP Y EVENTOS
       ========================================================================== */
    const ProgressionApp = {
        state: {
            rootNote: 'C',
            mode: 'major-natural',
            chords: [],
            progressionSeq: [0, 3, 4, 0],
            selectedVoicings: {},
            editingSlotIndex: null
        },

        elements: {
            rootSelect: document.getElementById('root-note'),
            modeSelect: document.getElementById('scale-mode'),
            presetSelect: document.getElementById('preset-progression'),
            pool: document.querySelector('.custom-progression__pool'),
            dropzone: document.querySelector('.custom-progression__dropzone'),
            grid: document.querySelector('.chord-grid'),
            docTitle: document.querySelector('.chord-sheet__title'),
            docSubtitle: document.querySelector('.chord-sheet__subtitle'),
            modal: document.getElementById('voicing-modal'),
            modalClose: document.getElementById('btn-close-modal'),
            modalTitle: document.querySelector('.modal__dynamic-chord-name'),
            modalGrid: document.querySelector('.voicing-grid'),
            printBtn: document.getElementById('btn-print-pdf')
        },

        init() {
            this.bindEvents();
            this.updateTheoryState();
        },

        bindEvents() {
            this.elements.rootSelect.addEventListener('change', (e) => { this.state.rootNote = e.target.value; this.updateTheoryState(); });
            this.elements.modeSelect.addEventListener('change', (e) => { this.state.mode = e.target.value; this.updateTheoryState(); });
            
            this.elements.presetSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'I-IV-V-I') this.state.progressionSeq = [0, 3, 4, 0];
                if (val === 'ii-V-I') this.state.progressionSeq = [1, 4, 0];
                if (val === 'I-vi-IV-V') this.state.progressionSeq = [0, 5, 3, 4];
                if (val === 'I-V-vi-IV') this.state.progressionSeq = [0, 4, 5, 3];
                if (val === 'vi-IV-I-V') this.state.progressionSeq = [5, 3, 0, 4];
                if (val === 'I-vi-ii-V') this.state.progressionSeq = [0, 5, 1, 4];
                this.syncDropzoneUI();
                this.renderSheet();
            });

            this.elements.printBtn.addEventListener('click', () => window.print());
            this.elements.modalClose.addEventListener('click', () => this.elements.modal.close());
            
            this.elements.grid.addEventListener('click', (e) => {
                const btn = e.target.closest('.button--edit');
                if (btn) this.openVoicingModal(parseInt(btn.dataset.index, 10));
            });

            this.setupDragAndDrop();
        },

        setupDragAndDrop() {
            this.elements.pool.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('degree-btn')) {
                    e.dataTransfer.setData('action', 'add');
                    e.dataTransfer.setData('index', e.target.dataset.degreeIndex);
                    e.target.style.opacity = '0.5';
                }
            });
            this.elements.pool.addEventListener('dragend', (e) => {
                if (e.target.classList.contains('degree-btn')) e.target.style.opacity = '1';
            });

            // Permitir arrastrar de vuelta a la piscina para eliminar
            this.elements.pool.addEventListener('dragover', (e) => e.preventDefault());
            this.elements.pool.addEventListener('drop', (e) => {
                e.preventDefault();
                const action = e.dataTransfer.getData('action');
                if (action === 'remove') {
                    const slotIndex = parseInt(e.dataTransfer.getData('index'), 10);
                    this.removeChordFromProgression(slotIndex);
                }
            });

            // Eventos para arrastrar los acordes que ya están dentro de la progresión
            this.elements.dropzone.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('custom-progression__slot')) {
                    e.dataTransfer.setData('action', 'remove');
                    e.dataTransfer.setData('index', e.target.dataset.slotIndex);
                    e.target.style.opacity = '0.5';
                }
            });
            this.elements.dropzone.addEventListener('dragend', (e) => {
                if (e.target.classList.contains('custom-progression__slot')) e.target.style.opacity = '1';
            });

            this.elements.dropzone.addEventListener('dragover', (e) => e.preventDefault());
            this.elements.dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                const action = e.dataTransfer.getData('action');
                if (action === 'add') {
                    const degreeIndexStr = e.dataTransfer.getData('index');
                    if (degreeIndexStr !== '') {
                        this.state.progressionSeq.push(parseInt(degreeIndexStr, 10));
                        this.syncDropzoneUI();
                        this.renderSheet();
                    }
                } 
                // Fallback de compatibilidad
                else if (!action) {
                    const degreeIndexStr = e.dataTransfer.getData('text/plain');
                    if (degreeIndexStr && !isNaN(degreeIndexStr)) {
                        this.state.progressionSeq.push(parseInt(degreeIndexStr, 10));
                        this.syncDropzoneUI();
                        this.renderSheet();
                    }
                }
            });

            this.elements.dropzone.addEventListener('dblclick', (e) => {
                if (e.target.classList.contains('custom-progression__slot')) {
                    const slotIndex = Array.from(this.elements.dropzone.children).indexOf(e.target);
                    if (slotIndex > -1) {
                        this.removeChordFromProgression(slotIndex);
                    }
                }
            });
        },

        removeChordFromProgression(slotIndex) {
            this.state.progressionSeq.splice(slotIndex, 1);
            
            // Reorganizar voicings seleccionados para que al borrar un bloque medio
            // los acordes subsiguientes no pierdan su variación guardada
            const newVoicings = {};
            for (const key in this.state.selectedVoicings) {
                const k = parseInt(key, 10);
                if (k < slotIndex) {
                    newVoicings[k] = this.state.selectedVoicings[k];
                } else if (k > slotIndex) {
                    newVoicings[k - 1] = this.state.selectedVoicings[k];
                }
            }
            this.state.selectedVoicings = newVoicings;

            this.syncDropzoneUI();
            this.renderSheet();
        },

        updateTheoryState() {
            this.state.chords = Theory.generateDiatonicChords(this.state.rootNote, this.state.mode);
            this.state.selectedVoicings = {};
            this.updateUIPoolText();
            this.syncDropzoneUI();
            this.renderSheet();
        },

        updateUIPoolText() {
            this.elements.pool.innerHTML = '';
            this.state.chords.forEach((chord, i) => {
                const btn = document.createElement('button');
                btn.className = 'degree-btn';
                btn.type = 'button';
                btn.draggable = true;
                btn.dataset.degreeIndex = i;
                btn.textContent = chord.degree;
                this.elements.pool.appendChild(btn);
            });
        },

        syncDropzoneUI() {
            this.elements.dropzone.innerHTML = '';
            this.state.progressionSeq.forEach((idx, slotIndex) => {
                const slot = document.createElement('div');
                slot.className = 'custom-progression__slot';
                slot.draggable = true;
                slot.dataset.slotIndex = slotIndex;
                slot.textContent = this.state.chords[idx].degree;
                slot.title = 'Arrastra fuera o doble clic para eliminar';
                this.elements.dropzone.appendChild(slot);
            });
        },

        renderSheet() {
            const rootText = this.elements.rootSelect.options[this.elements.rootSelect.selectedIndex].text;
            const modeText = this.elements.modeSelect.options[this.elements.modeSelect.selectedIndex].text;
            this.elements.docTitle.textContent = `Hoja de Práctica: Progresión en ${rootText} ${modeText}`;
            
            const progText = this.state.progressionSeq.map(idx => this.state.chords[idx].degree).join(' - ');
            this.elements.docSubtitle.textContent = `Movimiento Tonal: ${progText || 'Vacio'}`;

            this.elements.grid.innerHTML = '';
            this.state.progressionSeq.forEach((chordIndex, slotIndex) => {
                const chordData = this.state.chords[chordIndex];
                const voicings = GuitarEngine.getVoicings(chordData.rootNote, chordData.quality);
                
                const selectedVIdx = this.state.selectedVoicings[slotIndex] || 0;
                const activeVoicing = voicings[selectedVIdx] || voicings[0];

                if (activeVoicing) this.elements.grid.appendChild(UIBuilder.createChordCell(chordData, activeVoicing, slotIndex));
            });
        },

        openVoicingModal(slotIndex) {
            this.state.editingSlotIndex = slotIndex;
            const chordIndex = this.state.progressionSeq[slotIndex];
            const chordData = this.state.chords[chordIndex];
            const voicings = GuitarEngine.getVoicings(chordData.rootNote, chordData.quality);

            this.elements.modalTitle.textContent = chordData.fullName;
            this.elements.modalGrid.innerHTML = '';

            voicings.forEach((voicing, idx) => {
                const card = document.createElement('article');
                card.className = 'voicing-card';
                card.innerHTML = `<header class="voicing-card__header"><span class="voicing-card__number">Opción ${idx + 1}</span></header>`;
                
                const svgContainer = document.createElement('div');
                svgContainer.className = 'chord-svg-container chord-svg-container--thumbnail';
                svgContainer.appendChild(UIBuilder.buildSVG(voicing, chordData.fullName));

                const footer = document.createElement('footer');
                footer.className = 'voicing-card__footer';
                
                const btnFix = document.createElement('button');
                btnFix.className = 'button button--select';
                btnFix.type = 'button';
                btnFix.textContent = (this.state.selectedVoicings[slotIndex] === idx) ? 'Seleccionada' : 'Fijar';
                if(this.state.selectedVoicings[slotIndex] === idx) btnFix.disabled = true;

                btnFix.addEventListener('click', () => {
                    this.state.selectedVoicings[this.state.editingSlotIndex] = idx;
                    this.renderSheet();
                    this.elements.modal.close();
                });

                footer.appendChild(btnFix);
                card.append(svgContainer, footer);
                this.elements.modalGrid.appendChild(card);
            });

            if(typeof this.elements.modal.showModal === "function") {
                this.elements.modal.showModal();
            } else {
                this.elements.modal.style.display = 'block';
            }
        }
    };

    /* ==========================================================================
       6. NUEVO ENSAMBLADOR DE ACORDES
       ========================================================================== */
    const AssemblerApp = {
        state: {
            rootNote: 'C',
            quality: 'Maj',
            currentVoicings: [],
            selectedVoicingIndex: 0,
            sheetChords: [],
        },

        elements: {
            rootSelect: document.getElementById('assembler-root-note'),
            qualitySelect: document.getElementById('assembler-quality'),
            voicingsContainer: document.getElementById('assembler-voicings-container'),
            addBtn: document.getElementById('btn-add-chord-to-sheet'),
            grid: document.getElementById('assembler-grid'),
            header: document.getElementById('assembler-header'),
        },

        init() {
            this.populateSelectors();
            this.bindEvents();
            this.updateVoicingChoices();
            this.renderSheet();
        },

        populateSelectors() {
            Theory.NOTES_SHARP.forEach(note => {
                const opt = document.createElement('option');
                opt.value = note;
                opt.textContent = note;
                this.elements.rootSelect.appendChild(opt);
            });

            const qualities = ['Maj', 'min', '7', 'm7', 'Maj7', '6', 'm6', 'dim', 'dim7', 'm7b5', 'Aug', 'sus2', 'sus4', 'add9', '9', 'm9', 'Maj9'];
            qualities.forEach(q => {
                const opt = document.createElement('option');
                opt.value = q;
                opt.textContent = q;
                this.elements.qualitySelect.appendChild(opt);
            });
        },

        bindEvents() {
            this.elements.rootSelect.addEventListener('change', e => {
                this.state.rootNote = e.target.value;
                this.updateVoicingChoices();
            });
            this.elements.qualitySelect.addEventListener('change', e => {
                this.state.quality = e.target.value;
                this.updateVoicingChoices();
            });
            this.elements.addBtn.addEventListener('click', () => {
                this.addChordToSheet();
            });
        },

        updateVoicingChoices() {
            this.state.currentVoicings = GuitarEngine.getVoicings(this.state.rootNote, this.state.quality);
            this.state.selectedVoicingIndex = 0;
            this.elements.voicingsContainer.innerHTML = '';

            if (this.state.currentVoicings.length > 0) {
                this.state.currentVoicings.forEach((voicing, index) => {
                    const card = this.createVoicingCard(voicing, index);
                    this.elements.voicingsContainer.appendChild(card);
                });
                this.elements.addBtn.disabled = false;
            } else {
                this.elements.voicingsContainer.innerHTML = `<p class="chord-svg-placeholder" style="grid-column: 1 / -1;">No se encontró un voicing para ${this.state.rootNote} ${this.state.quality}.</p>`;
                this.elements.addBtn.disabled = true;
            }
        },

        createVoicingCard(voicing, index) {
            const chordName = `${this.state.rootNote} ${this.state.quality}`;
            const card = document.createElement('article');
            card.className = 'voicing-card voicing-card--preview';
            if (index === this.state.selectedVoicingIndex) {
                card.classList.add('voicing-card--selected');
            }
            
            card.innerHTML = `<header class="voicing-card__header"><span class="voicing-card__number">Opción ${index + 1}</span></header>`;
            
            const svgContainer = document.createElement('div');
            svgContainer.className = 'chord-svg-container';
            svgContainer.appendChild(UIBuilder.buildSVG(voicing, chordName));
            card.appendChild(svgContainer);

            card.addEventListener('click', () => {
                this.state.selectedVoicingIndex = index;
                this.elements.voicingsContainer.querySelectorAll('.voicing-card').forEach((c, i) => {
                    c.classList.toggle('voicing-card--selected', i === index);
                });
            });

            return card;
        },

        addChordToSheet() {
            const selectedVoicing = this.state.currentVoicings[this.state.selectedVoicingIndex];
            if (!selectedVoicing) return;

            this.state.sheetChords.push({
                fullName: `${this.state.rootNote} ${this.state.quality}`,
                voicing: selectedVoicing
            });
            this.renderSheet();
        },

        renderSheet() {
            this.elements.grid.innerHTML = '';
            this.state.sheetChords.forEach((chord, index) => {
                const cell = this.createAssemblerCell(chord, index);
                this.elements.grid.appendChild(cell);
            });
        },

        createAssemblerCell(chordData, index) {
            const section = document.createElement('section');
            section.className = 'chord-cell';
            
            section.innerHTML = `
                <header class="chord-cell__header">
                    <h3 class="chord-cell__name">${chordData.fullName}</h3>
                </header>
                <div class="chord-svg-container"></div>
                <footer class="chord-cell__footer">
                    <button class="button button--delete" type="button" data-index="${index}">
                        <span class="button__icon">🗑️</span> Eliminar
                    </button>
                </footer>
            `;
            
            section.querySelector('.chord-svg-container').appendChild(UIBuilder.buildSVG(chordData.voicing, chordData.fullName));
            section.querySelector('.button--delete').addEventListener('click', () => {
                this.state.sheetChords.splice(index, 1);
                this.renderSheet();
            });

            return section;
        }
    };

    /* ==========================================================================
       7. NUEVO EXPLORADOR DE ESCALAS
       ========================================================================== */
    const ScaleExplorerApp = {
        state: {
            rootNote: 'C',
            mode: 'major-natural',
        },

        elements: {
            rootSelect: document.getElementById('scale-explorer-root'),
            modeSelect: document.getElementById('scale-explorer-mode'),
            fretboardContainer: document.getElementById('scale-explorer-fretboard'),
        },

        constants: {
            TUNING: [4, 9, 14, 19, 23, 28], // EADGBe como índices desde C=0, E=4
            NUM_FRETS: 15,
        },

        init() {
            this.populateSelectors();
            this.bindEvents();
            this.renderFretboard();
        },

        populateSelectors() {
            Theory.NOTES_SHARP.forEach(note => {
                const opt = document.createElement('option');
                opt.value = note;
                opt.textContent = note;
                this.elements.rootSelect.appendChild(opt);
            });

            for (const mode in Theory.SCALE_INTERVALS) {
                const opt = document.createElement('option');
                opt.value = mode;
                opt.textContent = document.querySelector(`#scale-mode option[value="${mode}"]`).textContent;
                this.elements.modeSelect.appendChild(opt);
            }
        },

        bindEvents() {
            this.elements.rootSelect.addEventListener('change', e => {
                this.state.rootNote = e.target.value;
                this.renderFretboard();
            });
            this.elements.modeSelect.addEventListener('change', e => {
                this.state.mode = e.target.value;
                this.renderFretboard();
            });
        },

        renderFretboard() {
            const scaleNotes = Theory.generateScaleNotes(this.state.rootNote, this.state.mode);
            const tuning = this.constants.TUNING;
            const numFrets = this.constants.NUM_FRETS;

            const svg = UIBuilder.createSVGElement('svg', {
                class: 'fretboard-svg',
                viewBox: `0 0 ${80 + numFrets * 50} 140`
            });

            // Render Frets and Strings
            const gridGrp = UIBuilder.createSVGElement('g', { transform: 'translate(50, 20)' });
            for (let i = 0; i <= numFrets; i++) { // Frets
                gridGrp.appendChild(UIBuilder.createSVGElement('line', {
                    x1: i * 50, y1: 0, x2: i * 50, y2: 100,
                    stroke: '#ccc', 'stroke-width': (i === 0) ? 5 : 1
                }));
            }
            for (let i = 0; i < 6; i++) { // Strings
                gridGrp.appendChild(UIBuilder.createSVGElement('line', {
                    x1: 0, y1: i * 20, x2: numFrets * 50, y2: i * 20,
                    stroke: '#333', 'stroke-width': 1 + (i * 0.2)
                }));
            }
            svg.appendChild(gridGrp);

            // Render Fret Markers (3, 5, 7, 9, 12)
            const markers = [3, 5, 7, 9, 12];
            markers.forEach(fret => {
                const marker = UIBuilder.createSVGElement('circle', {
                    cx: fret * 50 - 25,
                    cy: (fret === 12) ? 30 : 50,
                    r: 5,
                    fill: '#ddd'
                });
                gridGrp.appendChild(marker);
                if (fret === 12) {
                     const marker2 = UIBuilder.createSVGElement('circle', {
                        cx: fret * 50 - 25, cy: 70, r: 5, fill: '#ddd'
                    });
                    gridGrp.appendChild(marker2);
                }
            });

            // Render Scale Notes
            const notesGrp = UIBuilder.createSVGElement('g', { transform: 'translate(50, 20)' });
            for (let str = 0; str < 6; str++) {
                for (let fret = 0; fret <= numFrets; fret++) {
                    const noteIndex = (tuning[str] + fret) % 12;
                    const currentNote = Theory.NOTES_SHARP[noteIndex];
                    const currentNoteFlat = Theory.NOTES_FLAT[noteIndex];

                    if (scaleNotes.includes(currentNote) || scaleNotes.includes(currentNoteFlat)) {
                        const noteName = scaleNotes.find(n => n === currentNote || n === currentNoteFlat);
                        const isRoot = noteName === this.state.rootNote;

                        const noteGroup = UIBuilder.createSVGElement('g', { class: 'fretboard-svg__note' });
                        // FIX: Posiciona correctamente las notas al aire (traste 0) a la izquierda de la cejuela.
                        const x = (fret > 0) ? (fret * 50 - 25) : -20;
                        const y = str * 20;

                        const dot = UIBuilder.createSVGElement('circle', {
                            cx: x, cy: y, r: 9,
                            class: `fretboard-svg__note-dot ${isRoot ? 'fretboard-svg__note-dot--root' : ''}`
                        });

                        const text = UIBuilder.createSVGElement('text', {
                            x: x, y: y + 4, class: 'fretboard-svg__note-text'
                        });
                        text.textContent = noteName;

                        noteGroup.append(dot, text);
                        notesGrp.appendChild(noteGroup);
                    }
                }
            }
            svg.appendChild(notesGrp);

            this.elements.fretboardContainer.innerHTML = '';
            this.elements.fretboardContainer.appendChild(svg);
        }
    };

    /* ==========================================================================
       8. CONTROLADOR PRINCIPAL
       ========================================================================== */
    const MainController = {
        init() {
            ProgressionApp.init();
            AssemblerApp.init();
            ScaleExplorerApp.init();

            document.querySelector('.app-header__nav').addEventListener('click', e => {
                const target = e.target.closest('.button--nav');
                if (!target) return;

                document.querySelectorAll('.button--nav').forEach(b => b.classList.remove('button--nav-active'));
                target.classList.add('button--nav-active');

                document.getElementById('progression-generator-section').style.display = 'none';
                document.getElementById('chord-assembler-section').style.display = 'none';
                document.getElementById('scale-explorer-section').style.display = 'none';
                document.getElementById(target.dataset.section).style.display = 'block';
            });
        }
    };

    MainController.init();
});
