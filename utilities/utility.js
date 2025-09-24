function mergeInputWithResponse(inputList, responseList) {
  return responseList.map(responseItem => {
    const inputMatch = inputList.find(input => input.requestCode === responseItem.requestCode);
    return {
      ...responseItem,
      anagraficaInfo: inputMatch?.anagraficaInfo || {}
    };
  });
}

function mergeByRequestCode(bodyObj, responseObj) {
  const responsePayload = responseObj?.payload || {};
  const responseList = responsePayload.list || [];

  // Mappa i risultati ricevuti dalla chiamata API per codice richiesta
  const responseMap = new Map();
  responseList.forEach(item => {
    if (item?.requestCode) {
      responseMap.set(item.requestCode, item);
    }
  });

  // Unisci i dati anagrafici e i risultati della verifica
  const mergedList = bodyObj.list.map(item => {
    const match = responseMap.get(item.requestCode);

    if (!match) {
      console.warn(`⚠️ Nessuna corrispondenza per requestCode: ${item.requestCode}`);
    }

    return {
      ...item,
      validationStatus: match?.validationStatus || null,
      error: match?.error || null,
      bankInfo: match?.bankInfo || null,
      requestId: match?.requestId || null
    };
  });

  // 🔁 Ritorna un oggetto strutturato come il JSON iniziale ma con lista unita
  return {
    status: responseObj?.status || 'UNKNOWN',
    bulkRequestId: responsePayload.bulkRequestId,
    bulkRequestStatus: responsePayload.bulkRequestStatus,
    completedDatetime: responsePayload.completedDatetime,
    processedItemsCount: responsePayload.processedItemsCount,
    totalItemsCount: responsePayload.totalItemsCount,
    list: mergedList,
    errors: responseObj?.errors || [],
    warnings: responseObj?.warnings || null
  };
}

module.exports = {
  mergeInputWithResponse,
  mergeByRequestCode
};