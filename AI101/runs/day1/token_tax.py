"""Day 1 — how many tokens does the same sentence cost in each language?

Run:  pip install tiktoken && python token_tax.py
"""
import tiktoken

# Article 1, Universal Declaration of Human Rights, official translations.
# https://www.ohchr.org/en/human-rights/universal-declaration/translations
SENTENCES = {
    "English": "All human beings are born free and equal in dignity and rights.",
    "Hindi": "सभी मनुष्यों को गौरव और अधिकारों के मामले में जन्मजात स्वतन्त्रता और समानता प्राप्त है।",
    "Bengali": "সমস্ত মানুষ স্বাধীনভাবে সমান মর্যাদা এবং অধিকার নিয়ে জন্মগ্রহণ করে।",
    "Tamil": "மனிதப் பிறவியினர் சகலரும் சுதந்திரமாகவே பிறக்கின்றனர்.",
}

ENCODINGS = ["cl100k_base", "o200k_base"]


def count(text: str, encoding_name: str) -> int:
    """Return the number of tokens `encoding_name` splits `text` into."""
    # TODO: get the encoding with tiktoken.get_encoding, encode `text`,
    # return the length. Two lines. Write them before reading the docs.
    raise NotImplementedError


def fertility(text: str, encoding_name: str) -> float:
    """Tokens per character. The number that survives comparing sentences
    of different lengths."""
    # TODO: why per CHARACTER and not per word? Write your answer as a
    # comment here before you write the line of code. Devanagari and Tamil
    # do not put spaces where English does, so a word count is not
    # comparable across these four rows. Check that claim rather than
    # trusting this comment.
    raise NotImplementedError


def main() -> None:
    for encoding_name in ENCODINGS:
        english_tokens = count(SENTENCES["English"], encoding_name)
        print(f"\n{encoding_name}")
        print(f"{'language':10} {'chars':>6} {'tokens':>7} {'tok/char':>9} {'vs English':>11}")
        for language, text in SENTENCES.items():
            tokens = count(text, encoding_name)
            # TODO: the ratio against English. Decide, and write down,
            # whether you are comparing raw token counts or tokens per
            # character. They give different multipliers and only one of
            # them answers "what does my API call cost".
            ratio = ...
            print(f"{language:10} {len(text):6} {tokens:7} {fertility(text, encoding_name):9.3f} {ratio:>11}")


if __name__ == "__main__":
    main()
