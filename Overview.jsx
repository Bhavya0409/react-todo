'use strict';

const {get, post, put} = axios;
import update from 'react/lib/update';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sideNavigationLinks } from '../navigation-links/navigation-links';
import { displayNotification } from '../../../redux/actions/global-notifications';
import { getEvalueeOverviewCharts } from '../../../redux/actions/evaluee-overview-charts';
import SideNavigation from '../../../components/shared/Navigation/SideNavigation/SideNavigation';
import ProfileInfo from '../../../components/shared/EvalueeLanding/ProfileInfo/ProfileInfo';
import VisualData from '../../../components/shared/EvalueeLanding/VisualData/VisualData';
import ConfirmationModal from '../../../components/modals/ConfirmationModal/ConfirmationModal';
import OverviewNotesModal from '../../../components/modals/OverviewNotesModal/OverviewNotesModal';
import { EvalueeNotesSection, EvalueeNestedNotesSection, EvalueeNotesHighlights } from '../../../components/EvalueeNotesSection/EvalueeNotesSection';

const mapStateToProps = ({evalueeOverviewCharts, auth}) => {
  return {
    evalueeOverviewCharts,
    auth
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getEvalueeOverviewCharts: bindActionCreators(getEvalueeOverviewCharts, dispatch),
    displayNotification: bindActionCreators(displayNotification, dispatch)
  };
};

const confirmationModalContent = {
  title: 'Notes',
  message: `Are you sure you want to delete this note?`,
  buttons: ['Delete Note', 'Cancel']
};

export class EvalueeOverview extends Component {
  state = {
    evalueeClients: [],
    evalueeNotes: {
      clientImpact: [],
      entrepreneurship: [],
      firmBuilding: [],
      peopleDevelopment: []
    },
    charts: {
      client_hours: [],
      industry: [],
      function: []
    },
    notesModalData: null,
    confirmationModalData: false,
    evaluator: false
  };

  static colorSets =[
    '#0065BD', '#00ADEF', '#AD005B', '#009AA6',
    '#0825B4', '#E54B51', '#66307C', '#7ED321',
    '#16416A', '#0065BD', '#7D9AAA', '#004F62'
  ];

  static profileData = {
    noEvaluatorMsg: 'You have not been Assigned an Evaluator',
    download: {
      label: 'What We Value in Our Partners (PDF)',
      url: '/downloads/What_We_Value_Generalists.pdf'
    },
    nextSteps: {
      deadlines: [
        {
          label: 'EY17 Cycle Kick Off',
          date: 'March 13, 2017'
        },
        {
          label: 'Practice Affiliation & Exposure List',
          date: 'March 16, 2017'
        },
        {
          label: 'Fact Sheet',
          date: 'March 24, 2017'
        },
        {
          label: 'Impact Summary',
          date: 'March 24, 2017'
        },
        {
          label: 'Client Relationship Profile',
          date: 'March 24, 2017'
        }
      ],
    }
  };

  componentDidMount() {
    const {getEvalueeOverviewCharts, auth, params} = this.props;

    this.getEvalueeClients(auth.id)
      .then(() => this.getEvalueeNotes(auth.id));

    getEvalueeOverviewCharts(auth.id)
      .then(this.setChartsData);

    this.getEvaluator(params.evaluee_id);
  };

  getEvaluator = (id) => {
    return get(`/evaluator-for/${id}`)
      .then(({data}) => {
        const evaluator = data;
        if (evaluator) {
          this.setState(update(this.state, {
            evaluator: {
              $set: data
            }
          }));
        }
      });
  };

  getEvalueeClients = (id) => {
    return get(`/users/${id}/clients`)
      .then(({data}) => {
        this.setState({
          evalueeClients: data
        });
      });
  };

  getEvalueeNotes = (id) => {
    return get(`/users/${id}/notes`)
      .then(({data}) => {
        let evalueeNotes = {
          clientImpact: [],
          entrepreneurship: [],
          firmBuilding: [],
          peopleDevelopment: []
        };
        _.each(data, (note) => {
          if (!evalueeNotes[note.type]) return;
          const clientId = note.client_id;
          if (clientId) {
            note.client_name = this.findClient(clientId).name;
          }
          evalueeNotes[note.type].push(note);
        });
        this.setState({
          evalueeNotes
        });
      });
  };

  findClient = (id) => {
    return _.find(this.state.evalueeClients, {
      id
    });
  };

  setChartsData = () => {
    const {evalueeOverviewCharts} = this.props;
    this.setState(update(this.state, {
      charts: {
        $set: evalueeOverviewCharts.data
      }
    }));
  };

  openNoteModal = (e, name, note) => {
    e.preventDefault();
    this.setState(update(this.state, {
      notesModalData: {
        $set: {
          name,
          note
        }
      }
    }));
  };

  openHighlightNoteModal = (e, name, note = {}) => {
    note.is_highlight = true;
    this.openNoteModal(e, name, note);
  };

  openConfirmationModal = (e, note) => {
    e.preventDefault();
    this.setState(update(this.state, {
      confirmationModalData: {
        $set: note
      }
    }));
  };

  addNote = (note) => {
    const userId = this.props.auth.id;
    const noteId = note.id;
    const method = _.isNil(noteId) ? post : put;
    return method(`/users/${userId}/notes/${noteId || ''}`, note)
      .then(() => {
        this.props.displayNotification({
          message: `Note has been successfully ${method === put ? 'updated' : 'added'}.`
        });
        this.getEvalueeNotes(userId);
      })
      .then(this.closeModal);
  };

  deleteNote = (e) => {
    e.preventDefault();
    const userId = this.props.auth.id;
    const {id} = this.state.confirmationModalData;
    return axios.delete(`/users/${userId}/notes/${id}`)
      .then(() => {
        this.props.displayNotification({
          message: 'Note has been successfully deleted.'
        });
        this.closeModal(null);
      })
      .then(() => this.getEvalueeNotes(userId));
  };

  closeModal = (e) => {
    e && e.preventDefault();
    this.setState(update(this.state, {
      notesModalData: {
        $set: null
      },
      confirmationModalData: {
        $set: null
      }
    }));
  };

  categorizeClientImpactNotes(notes) {
    let categorizedNotes = {};
    _.each(notes, (note) => {
      const clientName = note.client_name;
      categorizedNotes[clientName] = categorizedNotes[clientName] || [];
      categorizedNotes[clientName].push(note);
    });
    return categorizedNotes;
  }

  getHighlightNotes() {
    const {evalueeNotes} = this.state;
    return {
      impactfulClientServer: _.find(evalueeNotes.clientImpact, 'is_highlight'),
      entrepreneur: _.find(evalueeNotes.entrepreneurship, 'is_highlight'),
      firmBuilder: _.find(evalueeNotes.firmBuilding, 'is_highlight'),
      talentDeveloper: _.find(evalueeNotes.peopleDevelopment, 'is_highlight')
    };
  }

  render() {
    const {charts, evalueeClients, evalueeNotes, notesModalData, evaluator, confirmationModalData} = this.state;
    const clientImpact = this.categorizeClientImpactNotes(evalueeNotes.clientImpact);
    return (
      <div className="evaluee-overview">
        <div className="container main-content">
          <div className="row">
            <div className="col-sm-12 main-content">
              { /* mock header */ }
              <div className="block block-item profile-info">
                <ProfileInfo data={ EvalueeOverview.profileData }
                             evaluator={ evaluator } />
              </div>
              { /* highlight notes */ }
              <div className="block block-item clearfix">
                <h3>Highlights</h3>
                <EvalueeNotesHighlights data={ this.getHighlightNotes() }
                                        findClient={ this.findClient }
                                        openModal={ this.openHighlightNoteModal } />
              </div>
              { /* charts */ }
              <div className="block block-item industries-clients-engagements">
                { charts && (
                  <VisualData data={ charts }
                              colorSets={ EvalueeOverview.colorSets } />
                  ) }
              </div>
              { /* client impact notes */ }
              <EvalueeNestedNotesSection name="impactfulClientServer"
                                         data={ clientImpact }
                                         openModal={ this.openNoteModal }
                                         openConfirmationModal={ this.openConfirmationModal } />
              { /* entrepreneurship notes */ }
              <EvalueeNotesSection name="entrepreneur"
                                   data={ evalueeNotes.entrepreneurship }
                                   openModal={ this.openNoteModal }
                                   openConfirmationModal={ this.openConfirmationModal } />
              { /* firm building notes */ }
              <EvalueeNotesSection name="firmBuilder"
                                   data={ evalueeNotes.firmBuilding }
                                   openModal={ this.openNoteModal }
                                   openConfirmationModal={ this.openConfirmationModal } />
              { /* people development notes */ }
              <EvalueeNotesSection name="talentDeveloper"
                                   data={ evalueeNotes.peopleDevelopment }
                                   openModal={ this.openNoteModal }
                                   openConfirmationModal={ this.openConfirmationModal } />
            </div>
          </div>
        </div>
        { /* notes modal */ }
        <OverviewNotesModal data={ notesModalData }
                            clients={ evalueeClients }
                            onSubmit={ this.addNote }
                            onClose={ this.closeModal } />
        { /* confirmation modal */ }
        <ConfirmationModal { ...confirmationModalContent }
                           open={ confirmationModalData }
                           onClick={ (e) => {
                                       if (e.target.name === "ok") {
                                         this.deleteNote(e);
                                       } else {
                                         this.closeModal(e);
                                       }
                                     } } />
      </div>
      );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EvalueeOverview);
