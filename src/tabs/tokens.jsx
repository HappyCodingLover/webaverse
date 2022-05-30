/* eslint-disable camelcase */
/* eslint-disable no-useless-escape */

import React, { useContext, useEffect, useState } from 'react';
import classnames from 'classnames';

import { tokensHost } from '../../constants';
import { AppContext } from '../components/app';

import styles from '../Header.module.css';

//

export const Tokens = ({userOpen, loginFrom, hacks, address}) => {

    const { state } = useContext( AppContext );
    const [nftPreviews, setNftPreviews] = useState({});
    const [nfts, setNfts] = useState(null);
    const [mynfts, setmyNfts] = useState(null);
    const [mynftPreviews, setmyNftPreviews] = useState([]);
    const [fetchPromises, setFetchPromises] = useState([]);

    //

    useEffect( () => {

        if ( address && !nfts && loginFrom ) {

            setNfts([]);

            (async () => {

                if (loginFrom === 'metamask') {

                    const res = await fetch(`https://api.opensea.io/api/v1/assets?owner=${address}&limit=${50}`, { headers: { 'X-API-KEY': '6a7ceb45f3c44c84be65779ad2907046', } });
                    const j = await res.json();
                    const {assets} = j;
                    // setNfts(assets);

                    const bayc_polygon = '0xdB3f95e907dC8a02096aB2C2b994466b3B7424e8';
                    const bayc_eth = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';
                    const polygon_chain = 'polygon';
                    const eth_chain = 'eth';
                    // Gets bored apes from main net via Moralis NFT API
                    const res1 = await fetch(`https://deep-index.moralis.io/api/v2/nft/${bayc_polygon}?chain=${polygon_chain}&format=decimal&limit=10
                    `, { headers: { 'X-API-KEY': 'H2SjTrwPQu29K2foKhDUP7d4e9JdNGpWZvNtzvK1IX8XKmgrEB8Q5ix35AzBnZdd', 'accept': 'application/json' } });
                    const boredApesResult = await res1.json();
                    const boredApes = boredApesResult.result;

                    setmyNfts(boredApes);


                } else if (loginFrom === 'discord') {

                    let res = await fetch(`${tokensHost}/${address}`);
                    res = await res.json();

                    res = res.map(_nft => {

                        /** Modify the response recieved from the API-Backend to match standardise format */
                        _nft.image_preview_url = _nft.hash;
                        return _nft;

                    });

                    setNfts(res);

                }

            })();

        }

    }, [ address, nfts, loginFrom ] );

    useEffect( () => {

        if (nfts) {

            for (const nft of nfts) {
                console.log('nft.image_preview_url', nft.image_preview_url);

                if (!nftPreviews[nft.image_preview_url]) {

                    nftPreviews[nft.image_preview_url] = 'images/object.jpg';

                    if (loginFrom === 'metamask') {

                        fetch(nft.image_preview_url).then(response => response.blob()).then(imageBlob => {
                            console.log('imageBlob', imageBlob);

                            const imageObjectURL = URL.createObjectURL(imageBlob);
                            console.log('imageObjectURL', imageObjectURL);
                            nftPreviews[nft.image_preview_url] = imageObjectURL;
                            setNftPreviews(nftPreviews);

                        });

                    } else if (loginFrom === 'discord') {

                        /** Will be switched after Previews-Merge */
                        // preview(nft.image_preview_url, nft.ext, 'png', 100, 100).then(res => {
                        //   const imageObjectURL = URL.createObjectURL(res.blob);
                        //   nftPreviews[nft.image_preview_url] = imageObjectURL;
                        //   setNftPreviews(nftPreviews);
                        // });
                    }

                }

            }

            setNftPreviews(nftPreviews);

        }

        if (mynfts) {
            console.log('mynfts', mynfts);
            for (const nft of mynfts) {
                // metadata
                let metadata = JSON.parse(nft.metadata);
                // generates ape image url
                // let imageUrl = 'https://ipfs.io/ipfs/' + metadata.image.slice(7);
                let imageUrl = metadata.image;
                if (!mynftPreviews[imageUrl]) {
                    mynftPreviews[imageUrl] = 'images/object.jpg';
                    fetch(imageUrl).then(response => response.blob()).then(imageBlob => {
                        const imageObjectURL = URL.createObjectURL(imageBlob);
                        mynftPreviews[imageUrl] = imageObjectURL;
                        setmyNftPreviews(mynftPreviews);

                    }).catch((e) => console.error('error in imageblob generation', e));
                }
            }
            setmyNftPreviews(mynftPreviews);
            console.log('mynftPreviews', mynftPreviews);
        }

    });

    //

    return (
        <section className={classnames(styles.sidebar, state.openedPanel === 'UserPanel' ? styles.open : null)}
            onClick={e => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
                {(mynfts || []).map((nft, i) => {
                    // const {id, asset_contract, hash, name, description} = nft;
                    const {token_id, token_hash} = nft;
                    // let imageUrl = 'https://ipfs.io/ipfs/' + JSON.parse(nft.metadata).image.slice(7);
                    let metadata = JSON.parse(nft.metadata);
                    const {image, name, description} = metadata;

                    // const image_preview_url = hacks.getNftImage(nft);
                    /* if (!image_preview_url) {
                                console.log('got nft', {nft, hacks, image_preview_url});
                                debugger;
                            } */
                    // "https://storage.opensea.io/files/099f7815733ba38b897f892a750e11dc.svg"
                    // console.log(nft);
                    return <div className={styles.nft} onDragStart={e => {
                    e.dataTransfer.setData('application/json', JSON.stringify(nft));
                    }} draggable key={i}>
                    <img src={mynftPreviews[image] || 'images/object.jpg'} className={styles.preview} />
                    <div className={styles.wrap}>
                        <div className={styles.name}>{name}</div>
                        <div className={styles.description}>{description}</div>
                        <div className={styles.tokenid}>{token_hash} / {token_id}</div>
                    </div>
                    </div>;
                })}
        </section>
    );

};
