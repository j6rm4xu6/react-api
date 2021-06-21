import React, { useEffect, useState } from 'react';
import { Grid ,Segment} from 'semantic-ui-react'
import './css.css'


function NumberLists() {

    const [ userList , setUserList ] =  useState([]);
   

    useEffect(()=>{
        fetch(
            'http://localhost:9988/api/users',
            {
                method:"GET",
            }
        )
            .then(res => res.json())
            .then(response => {
                setUserList ( response.ret );
            })
            .catch(error => console.log(error));
    });

    return (
        <Grid stretched ={true} columns={3} padded className="userList-wrap">
            {
                userList.map((user , index)=> {
                
                    return(
                        <div key={user.id}>
                            <Grid.Column className="user-box" >
                                <Segment>
                                    <p data-enable={user.enable} data-locked={user.locked}>會員編號：{user.id}<br/>使用者名稱：{user.username}<br/>註冊時間：{user.created_at}</p>
                                </Segment>
                            </Grid.Column>
                        </div>
                    );
                
                })
            }
        </Grid>
    );
}

export default NumberLists;
