import  {agenda, ready}  from './agenda';
import './jobs/defineJobs';

const startAgenda = async () => {
  await ready;
};

startAgenda();