import './Concept.css'

function Concept() {
    return (
        <div className="concept">
            <div className="concept-content">
                <div className="concept-title-overlay">
                    <h1 className="concept-title">MONTE</h1>
                </div>

                <div className="concept-text">
                    <p className="concept-intro">
                        Loop Rave es más que danzar al ritmo de la música electrónica, es reunirnos
                        para crear un espacio radical sintiente que crea lazos. Un ritual y territorio
                        irrepetible, haciéndolo un espacio a lo diverso, raro y político.
                    </p>

                    <p>
                        Cuestionando quién tiene el control de cómo experimentamos la cultura local
                        y lo que sobre sus raíces y esencia.
                    </p>

                    <div className="concept-signature">
                        <p className="sound-types">
                            <span className="sound-type">Sonido AMBIENT</span>
                            <span className="sound-type">Hypnotic Groove</span>
                            <span className="sound-type">Techno Experimental</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Concept
