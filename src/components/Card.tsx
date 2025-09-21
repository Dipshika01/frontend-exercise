type CardModel = {
  id: string;
  img: string;         
  isFlipped: boolean;
  isMatched: boolean;
};

type Props = {
  card: CardModel;
  backSrc: string;    
  onFlip: (id: string) => void;
};

export default function Card({ card, backSrc, onFlip }: Props) {
  const showFront = card.isFlipped || card.isMatched;
  const canClick = !card.isMatched && !card.isFlipped;

  return (
    <button
      type="button"
      aria-label="memory-card"
      onClick={canClick ? () => onFlip(card.id) : undefined}
      className="relative w-full aspect-square cursor-pointer rounded-xl overflow-hidden border border-gray-300 bg-white shadow-sm transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]
                 [perspective:1000px]"  
    >
      <div
        className={`absolute inset-0 h-full w-full transition-transform duration-500 [transform-style:preserve-3d]
          ${showFront ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
          <img
            src={backSrc}
            alt="Card back"
            className="absolute inset-0 m-auto h-14 w-14 opacity-95 drop-shadow"
          />
        </div>

        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden">
          <img
            src={card.img}
            alt="Card front"
            className="block h-full w-full object-cover"  
            loading="lazy"
          />
          {card.isMatched && (
            <div className="absolute inset-0 rounded-xl ring-4 ring-green-400/70" />
          )}
        </div>
      </div>
    </button>
  );
}
