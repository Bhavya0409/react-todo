import React from 'react';

const limitsize = (string, maxSize) => {
  const newLinesCount = string.split('\n').length * 6;
  const stringLength = string.length + newLinesCount;
  return (stringLength < maxSize) ? string
    : `${string.slice(0, maxSize - newLinesCount)}...`;
};

export const HighlightNote = ({ name, note, hasClient, openModal }) => (
  <a href="#"
     onClick={(e) => openModal(e, name, note)}>
    <p>{_.startCase(name)}</p>
    <h4>{hasClient ? hasClient.name : note.title}</h4>
    <p>{limitsize(note.description, 200)}</p>
    {note.description.length > 200 && (
      <p className="see-more">See More</p>
    )}
  </a>
);

export const HighlightNotePlaceholder = ({ name, openModal }) => (
  <a href="#" className={name}
     onClick={(e) => openModal(e, name)}>
    <i className="mck-icon__plus"></i>
    <p>Show your Top {_.startCase(name)} Note Here! </p>
  </a>
);

export const EvalueeNotesHighlights = ({ data, findClient, openModal }) => {
  return (
    <ul className="notes-highlights">
      {_.map(data, (note, name) => {
        const hasClient = note && findClient(note.client_id);
        return (
          <li key={name}
              className={`col-sm-3 ${note ? 'has-highlight' : ''}`}>
            {note ?
              <HighlightNote name={name}
                             note={note}
                             hasClient={hasClient}
                             openModal={openModal} />
              :
              <HighlightNotePlaceholder name={name}
                                        openModal={openModal} />

            }
          </li>
        );
      })}
    </ul>
  );
};

export const EvalueeNestedNotesSection = ({ name, data, openModal, openConfirmationModal }) => (
  <div className="evaluee-notes-section block">
    <h3>{_.startCase(name)}</h3>
    <a href="#"
       className="add-note pull-right"
       onClick={(e) => openModal(e, name)}>
      Add a Note
    </a>
    <ul className="notes-list">
      {_.map(data, (notes, client) => (
        <li key={client}>
          <div>
            <div className="notes-header">
              <i className="circle"></i>
              <h4>{client}</h4>
            </div>
            <ul className="nested-notes-list">
              {_.map(notes, (note, i) => (
                <li key={i}
                    className="notes-separator">
                  <a href="#"
                     onClick={(e) => openModal(e, name, note)}>
                    <i className="mck-icon__pencil pull-right"></i>
                  </a>
                  <a href="#"
                     onClick={(e) => openConfirmationModal(e, note)}>
                    <i className="mck-icon__x-circle pull-right"></i>
                  </a>
                  <p>{note.description}</p>
                  {note.is_highlight && (
                    <span>Selected as a Personal Highlight</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export const EvalueeNotesSection = ({ name, data, openModal, openConfirmationModal }) => (
  <div className="evaluee-notes-section block">
    <h3>{_.startCase(name)}</h3>
    <a href="#"
       className="add-note pull-right"
       onClick={(e) => openModal(e, name)}>
      Add a Note
    </a>
    <ul className="notes-list">
      {_.map(data, (note, i) => (
        <li key={i}
            className="notes-seperator">
          <a href="#"
             onClick={(e) => openModal(e, name, note)}>
            <i className="mck-icon__pencil pull-right"></i>
          </a>
          <a href="#"
             onClick={(e) => openConfirmationModal(e, note)}>
            <i className="mck-icon__x-circle pull-right"></i>
          </a>
          <h4>{note.title}</h4>
          <p>{note.description}</p>
          {note.is_highlight && (
            <span>Selected as a Personal Highlight</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);
