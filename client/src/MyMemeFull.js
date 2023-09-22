import { Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom'; //abilitare react-router

function MyMemeFull(props) {
    //Prepare variables
    let title = props.meme['title'];
    let image = "./meme_images/meme_" + props.pattern['patternid_and_imagename'] + ".jpg";
    let creator_name = props.meme['creator_name'];
    let text_array = props.meme['text'].split(";");
    let balloons = [], loop_balloons_counter = -1;
    for (let balloon of props.pattern['coordinates_full'].split(";")) { //it loops all balloons
        let balloon_field = balloon.split(",");

        balloons.push({
            //coordinates ordered as in DB
            "maxHeight": parseInt(balloon_field[0]),
            "maxWidth": parseInt(balloon_field[1]),
            "left": parseInt(balloon_field[2]),
            "right": parseInt(balloon_field[3]),
            "top": parseInt(balloon_field[4]),
            "bottom": parseInt(balloon_field[5]),
            "fontSize": parseInt(balloon_field[6]),
        });
    }

    return (<>
        <div className="mr-2 ml-2 mt-3">
            <div><h3>{title}</h3></div>

            <div style={{ height: 500, width: 500, position: "relative", margin: "auto" }}>

                {/*IMAGE*/}
                <Image style={{ height: "100%", width: "100%" }} src={image} rounded></Image>

                {/*BALLOONS*/}
                {balloons.map((balloon,index) => {
                    loop_balloons_counter = loop_balloons_counter + 1;
                    return (
                        <div key={index} style={{
                            //coordinates ordered as in DB-patterns
                            maxHeight: balloon["maxHeight"],
                            maxWidth: balloon["maxWidth"],
                            left: balloon["left"],
                            right: balloon["right"],
                            top: balloon["top"],
                            bottom: balloon["bottom"],
                            fontSize: balloon["fontSize"],
                            
                            //coordinates ordered as in DB-meme
                            fontFamily: props.meme["font"],
                            color: props.meme["color"],

                            fontWeight: "bold",
                            fontStyle: "italic",
                            wordWrap: "break-word",
                            overflow: "hidden",
                            position: "absolute"
                        }}>
                            {text_array[loop_balloons_counter]}
                        </div>
                    )
                })}

                {/*CREATOR LABEL*/}
                <div>
                    <div className="pt-4" style={{fontSize: 15 }}>Created by: <b>{creator_name}</b></div>
                </div>

                {/*RETURN BUTTON*/}
                <div className="pt-4 pb-4"><Link to="/"><Button variant="outline-primary">Back</Button></Link></div>
            </div>
        </div>
    </>
    )
}

export { MyMemeFull };