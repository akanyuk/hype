/**
 * @fileoverview
 * Registers a language handler for 6502 assembler.
 *
 * To use, include prettify.js and this file in your HTML page.
 * Then put your code in an HTML tag like
 *      <pre class="prettyprint lang-6502">(my 6502 code)</pre>
 *
 * @author aka dot nyuk at gmail dot com
 */
PR.registerLangHandler(
    PR.createSimpleLexer(
        [ // shortcutStylePatterns
 		// Whitespace
		[PR['PR_PLAIN'], /^[ \t\r\n\f]+/, null, ' \t\r\n\f'],

		// all comments begin with ';'
		[PR['PR_COMMENT'], /^;[^\r\n]*/, null, ';']
        ],
        [ // fallthroughStylePatterns
		[PR['PR_STRING'], 
         		/^\"(?:[^\n\r\f\\\"]|\\(?:\r\n?|\n|\f)|\\[\s\S])*\"/, null],
		[PR['PR_STRING'], 
         		/^\'(?:[^\n\r\f\\\']|\\(?:\r\n?|\n|\f)|\\[\s\S])*\'/, null],

		[PR['PR_KEYWORD'],
			/^(?:adc|and|asl|bcc|bcs|beq|bit|bmi|bne|bpl|brk|bvc|bvs|clc|cld|cli|clv|cmp|cpx|cpy|dec|dex|dey|eor|inc|inx|iny|jmp|jsr|lda|ldx|ldy|lsr|nop|ora|pha|php|pla|plp|rol|ror|rti|rts|sbc|sec|sed|sei|sta|stx|sty|tax|tay|tsx|txa|txs|tya|bra|phx|phy|plx|ply|stz|trb|tsb|rl|cop|jml|jsl|mvn|mvp|pea|pei|per|phb|phd|phk|plb|pld|rep|rtl|sep|tcd|tcs|tdc|tsc|txy|tyx|wdm|xba|xce)\b/i, null],

		[PR['PR_KEYWORD'],       
			/^(,|:|\+|\-|=|\(|\)|\[|\]|\{|\})/, null],

		[PR['PR_TYPE'],       
			/^(?:a|x|y|s)\b/i, null],

		// Decimal numbers
		[PR['PR_LITERAL'], /^(\d)\b/],

		// HEX
		[PR['PR_LITERAL'], /^(#|\$|#\$)(?:[0-9a-f]{1,4})\b/i],

		// BIN
		[PR['PR_LITERAL'], /^(%|~)(?:[0-9a-f]{1,8})\b/i],


		[PR['PR_PUNCTUATION'], 
			/^(?:!8|!08|!by|!byte|!16|!wo|!word|!24|!32|!fi|!fill|!align|!ct|!convtab|!tx|!text|!pet|!raw|!scrxor|!to|!source|!bin|!binary|!zn|!zone|!sl|!svl|!sal|!if|!ifdef|!for|!set|!do|while|until|!eof|!endoffile|!warn|!error|!serious|!macro|!initmem|!pseudopc|!cpu|!al|!as|!rl|!rs|plain|dcb)\b/i, null],

		[PR['PR_PUNCTUATION'], 
			/^(\*=|\.byte|\.sbyte|\.word)/i, null],

		// Temporary labels
		[PR['PR_PLAIN'], /^\.[1-9]{1,3}/i],

		// All others
		[PR['PR_PLAIN'], /^[a-z][_a-zA-Z0-9]*/i]


/*
		[PR['PR_PUNCTUATION'], /^(?:z|nz|c|nc|pe|po|p|m)\b/i, null],

		// Labels
		[PR['PR_PLAIN'], /^[_a-z1-9]*[\s\t]/i],
*/          	
        ]),
    ['6502']);
