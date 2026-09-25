"""Day 2 — show the merges, do not describe them.

Run:  python walk_merges.py
"""
import tiktoken

ENCODING = "cl100k_base"
WORDS = ["tokenisation", "टोकनीकरण", "வார்த்தை"]


def vocabulary(encoding_name: str) -> dict[bytes, int]:
    """The merge table: bytes -> rank. Rank 0 was merged first."""
    return tiktoken.get_encoding(encoding_name)._mergeable_ranks


def first_merges(encoding_name: str, n: int = 50) -> list[tuple[bytes, int]]:
    """The n earliest merges, which are the n most common byte pairs in
    whatever text this tokeniser was built from."""
    # TODO: sort vocabulary() by rank, take n. Read them before you write
    # anything else today. They tell you what the training text was.
    raise NotImplementedError


def walk(word: str, encoding_name: str) -> None:
    """Print each token of `word` with the rank at which it entered the
    vocabulary."""
    enc = tiktoken.get_encoding(encoding_name)
    ranks = vocabulary(encoding_name)
    for token_id in enc.encode(word):
        piece = enc.decode_single_token_bytes(token_id)
        # TODO: print the piece, its rank, and whether it is a whole
        # character or a fragment of one. A fragment is the evidence that
        # a merge failed. Deciding what counts as "a fragment of one" in
        # UTF-8 is the hard part and it is the point of today.
        raise NotImplementedError


def main() -> None:
    for piece, rank in first_merges(ENCODING):
        print(f"{rank:6} {piece!r}")
    for word in WORDS:
        print(f"\n--- {word}")
        walk(word, ENCODING)


if __name__ == "__main__":
    main()
