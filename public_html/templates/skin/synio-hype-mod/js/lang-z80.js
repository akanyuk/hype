/**
 * @fileoverview
 * Registers a language handler for z80 assembler.
 *
 * To use, include prettify.js and this file in your HTML page.
 * Then put your code in an HTML tag like
 *      <pre class="prettyprint lang-z80">(my z80 code)</pre>
 *
 * @author aka dot nyuk at gmail dot com
 */
PR.registerLangHandler(
    PR.createSimpleLexer(
        [ // shortcutStylePatterns
        
 		// Whitespace
		[PR['PR_PLAIN'], /^[ \t\r\n\f]+/, null, ' \t\r\n\f'],

		// all comments begin with ';'
		[PR['PR_COMMENT'], /^;[^\r\n]*/, null, ';'],
			
		// all comments begin with '//'
		[PR['PR_COMMENT'], /^\/\/[^\r\n]*/, null, '//']
		
        ],
        [ // fallthroughStylePatterns
		[PR['PR_STRING'], 
         		/^\"(?:[^\n\r\f\\\"]|\\(?:\r\n?|\n|\f)|\\[\s\S])*\"/, null],
		[PR['PR_STRING'], 
         		/^\'(?:[^\n\r\f\\\']|\\(?:\r\n?|\n|\f)|\\[\s\S])*\'/, null],

		// A C style block comment.  The <comment> production.
		[PR['PR_COMMENT'], 
        		/^\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//],

		[PR['PR_KEYWORD'],
			/^(?:neg|ccf|rl|cpl|scf|inc|dec|sub|sbc|add|adc|ei|di|halt|ld|rlca|rla|rrca|rra|rlc|rr|sla|sra|srl|rld|rrd|bit|ldir|ldi|lddr|ldd|cpi|cpir|cpd|cpdr|cp|xor|and|or|set|res|ex|exx|nop|im|call|jp|jr|ret|reti|retn|rst|in|ini|inir|ind|indr|out|outi|otir|outd|outr|sli|djnz|push|pop)\b/i, null],

		[PR['PR_KEYWORD'],       
			/^(,|:|\+|\-|\(|\))/, null],

		[PR['PR_PUNCTUATION'], 
			/^(?:display|macro|endm|rept|dup|edup|org|ent|page|savesna|savebin|savehob|shellexec|db|defb|dw|defw|ds|defs|if|ifn|endif|else|disp|equ|labelslist|incbin|include|device|abyte|abytec|abytez|align|assert|binary|block|byte|dc|dd|defarray|dephase|defd|defdevice|define|defm|dm|dz|dword|emptytrd|encoding|end|endlua|endmod|endmodule|endt|export|field|fpos|inchob|includelua|inctrd|insert|labelslist|lua|map|memorymap|module|output|page|phaserept|savetrd|size|slot|textarea|unphase|word|ifdef|ifndef|d24)\b/i, null],

		[PR['PR_TYPE'],       
			/^(?:a|b|c|d|e|f|h|l|af'?|hl'?|de'?|bc'?|iy|ix|r|i|sp)\b/i, null],

          	[PR['PR_TYPE'],       
          		/^(?:none|zxspectrum48|zxspectrum128|scorpion256|atmturbo512|_sjasmplus|_version|_release|_errors|_warnings)/i, null],

		// Temporary labels
		[PR['PR_PLAIN'], /^[1-9]{1,2}(f|b)/i],

		// Decimal numbers
		[PR['PR_LITERAL'], /^(\d)\b/],

		// HEX
		[PR['PR_LITERAL'], /^(#|\$)(?:[0-9a-f]{1,4})\b/i],

		// BIN
		[PR['PR_LITERAL'], /^%(?:[0-9a-f]{1,8})\b/i],

		// All others
		[PR['PR_PLAIN'], /^[a-z][_a-zA-Z0-9]*/i]

/*
		[PR['PR_PUNCTUATION'], /^(?:z|nz|c|nc|pe|po|p|m)\b/i, null],

		// Labels
		[PR['PR_PLAIN'], /^[_a-z1-9]*[\s\t]/i],
*/          	
        ]),
    ['z80']);
