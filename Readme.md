# CAD EXCHANGER COMPONENT
> A viewer and unloader to [CadExchanger Cloud](https://cloud.cadexchanger.com/)

## Description
A Vue component that received url of a cad file, upload it, and display the file on the cadExchanger viewer. Before destroy a request for file delete is being send.

## Using
At the moment the only way to set API keys are throw environment vars.

.env:
```
cadExchanger_clientId="" // The clientID API key
cadExchanger_client_secret="" // The clientSecret API key
cadExchanger_parentFolder="" // Parent folder ID for the uploaded files.
```

somefile.vue:
```Html
<template>
    <cadExchanger file_url="http://localhost:3000/cod1.x_t">
    </cadExchanger>
</template>
```

```JS
import cadExchanger from 'cadExchanger'

export default {
    ...
    components: { cadExchanger },
}
```

## Props

| Prop          | Type   | Description     | Default |
| ------------- | -------| --------------- | ------- |
| *file_url      | String | File url to display | None |
| *file_name     | String | File name without ext | None |
| width  | Number | Iframe width | None |
| hight | Number | Iframe height | None |
| keys_storage | String | Storage type of the API keys | "environment" |
| frameborder | Number | Iframe border width | 0 |

* At the moment the only way to set API keys are throw environment vars.

All [viewer properties](https://cloud.cadexchanger.com/dev/doc/data-viewer-api-embedded.html) (except the bg) are also props.